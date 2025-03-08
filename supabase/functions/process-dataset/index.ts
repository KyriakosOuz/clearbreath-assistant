
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { parseCSV, parseJSON, parseXLSX } from "./parsers.ts";
import { processDataset } from "./processor.ts";
import { 
  createSupabaseClient, 
  updateDatasetStatus, 
  fetchDataset, 
  downloadFile,
  savePrediction,
  updateDatasetWithResults
} from "./supabase-client.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body safely
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ error: "Empty request body" }),
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            } 
          }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
    
    const { datasetId } = body;
    
    if (!datasetId) {
      return new Response(
        JSON.stringify({ error: "Dataset ID is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    console.log(`Processing dataset: ${datasetId}`);
    
    try {
      // Update dataset status to Processing
      await updateDatasetStatus(supabase, datasetId, 'Processing');
      
      // Get dataset information
      const dataset = await fetchDataset(supabase, datasetId);
      
      // Download the file from storage
      const fileData = await downloadFile(supabase, dataset.file_name);
      
      // Parse the file content based on file type
      let parsedData: any[] = [];
      
      if (dataset.file_type === 'csv') {
        const fileContent = await fileData.text();
        parsedData = parseCSV(fileContent);
      } else if (dataset.file_type === 'json') {
        const fileContent = await fileData.text();
        parsedData = parseJSON(fileContent);
      } else if (dataset.file_type === 'xlsx') {
        const fileArrayBuffer = await fileData.arrayBuffer();
        parsedData = parseXLSX(fileArrayBuffer);
      }
      
      if (parsedData.length === 0) {
        console.error("No data parsed from file");
        
        // Update dataset status to Failed
        await updateDatasetStatus(supabase, datasetId, 'Failed');
        
        return new Response(
          JSON.stringify({ error: "No data found in file" }),
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            } 
          }
        );
      }
      
      // Process the data
      const processedResults = processDataset(parsedData);
      
      // Get a sample of the data for preview (first 5 rows)
      const dataPreview = parsedData.slice(0, 5);
      
      // Get column names
      const columnNames = Object.keys(parsedData[0]);
      
      // Update the dataset with processed information
      await updateDatasetWithResults(supabase, datasetId, dataPreview, columnNames, parsedData.length);
      
      // Create a new prediction record
      const prediction = await savePrediction(supabase, datasetId, processedResults);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Dataset processed successfully",
          dataset_id: datasetId,
          prediction_id: prediction.id
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    } catch (error) {
      console.error("Error processing dataset:", error);
      
      // Try to update dataset status to Failed
      try {
        await updateDatasetStatus(supabase, datasetId, 'Failed');
      } catch (updateError) {
        console.error("Error updating dataset status to Failed:", updateError);
      }
      
      return new Response(
        JSON.stringify({ error: error.message || "Error processing dataset" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
