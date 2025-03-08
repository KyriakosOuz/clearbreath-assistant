
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { parse as csvParse } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import * as path from "https://deno.land/std@0.170.0/path/mod.ts";

Deno.serve(async (req) => {
  try {
    // Get the API keys from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Create Supabase client with the service role key for full access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse the request body
    const { datasetId } = await req.json();

    if (!datasetId) {
      return new Response(
        JSON.stringify({ error: 'Dataset ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get dataset info from the database
    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('air_quality_datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError || !dataset) {
      return new Response(
        JSON.stringify({ error: 'Dataset not found', details: datasetError }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update dataset status to Processing
    await supabaseAdmin
      .from('air_quality_datasets')
      .update({ status: 'Processing' })
      .eq('id', datasetId);

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from('datasets')
      .download(dataset.file_name);

    if (fileError || !fileData) {
      await supabaseAdmin
        .from('air_quality_datasets')
        .update({ status: 'Failed' })
        .eq('id', datasetId);

      return new Response(
        JSON.stringify({ error: 'File not found', details: fileError }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process the file based on its type
    const fileExtension = path.extname(dataset.original_file_name).toLowerCase();
    let parsedData;
    let columnNames;
    let dataPreview;

    try {
      if (fileExtension === '.csv') {
        // For CSV files
        const fileContent = new TextDecoder().decode(fileData);
        parsedData = await csvParse(fileContent, { skipFirstRow: true, columns: true });
        
        // Get column names from the first row
        if (parsedData.length > 0) {
          columnNames = Object.keys(parsedData[0]);
        } else {
          columnNames = [];
        }
        
        // Create a data preview with up to 5 rows
        dataPreview = parsedData.slice(0, 5);
      } else if (fileExtension === '.json') {
        // For JSON files
        const fileContent = new TextDecoder().decode(fileData);
        parsedData = JSON.parse(fileContent);
        
        // Handle both array and object formats
        if (Array.isArray(parsedData)) {
          if (parsedData.length > 0) {
            columnNames = Object.keys(parsedData[0]);
            dataPreview = parsedData.slice(0, 5);
          } else {
            columnNames = [];
            dataPreview = [];
          }
        } else {
          columnNames = Object.keys(parsedData);
          dataPreview = parsedData; // For single-object JSON
        }
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      // Update the dataset with the processed information
      const rowCount = Array.isArray(parsedData) ? parsedData.length : 1;
      
      await supabaseAdmin
        .from('air_quality_datasets')
        .update({
          status: 'Completed',
          data_preview: dataPreview,
          column_names: columnNames,
          row_count: rowCount
        })
        .eq('id', datasetId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Dataset processed successfully',
          columnNames,
          rowCount
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing file:", error);
      
      await supabaseAdmin
        .from('air_quality_datasets')
        .update({ status: 'Failed' })
        .eq('id', datasetId);

      return new Response(
        JSON.stringify({ error: 'Error processing file', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
