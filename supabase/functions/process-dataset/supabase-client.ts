
// Supabase client and operations

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or service role key");
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export async function updateDatasetStatus(supabase: any, datasetId: string, status: string) {
  console.log(`Updating dataset ${datasetId} status to: ${status}`);
  
  const { error } = await supabase
    .from('air_quality_datasets')
    .update({ status })
    .eq('id', datasetId);
    
  if (error) {
    console.error(`Error updating dataset status to ${status}:`, error);
    throw error;
  }
  
  console.log(`Successfully updated dataset ${datasetId} status to: ${status}`);
}

export async function fetchDataset(supabase: any, datasetId: string) {
  console.log(`Fetching dataset with ID: ${datasetId}`);
  
  const { data, error } = await supabase
    .from('air_quality_datasets')
    .select('*')
    .eq('id', datasetId)
    .single();
    
  if (error || !data) {
    console.error("Error fetching dataset:", error);
    throw error || new Error("Dataset not found");
  }
  
  console.log(`Successfully fetched dataset: ${datasetId}`, { fileName: data.file_name, fileType: data.file_type });
  return data;
}

export async function downloadFile(supabase: any, fileName: string) {
  console.log(`Downloading file: ${fileName}`);
  
  const { data, error } = await supabase
    .storage
    .from('datasets')
    .download(fileName);
    
  if (error || !data) {
    console.error("Error downloading file:", error);
    throw error || new Error("File not found");
  }
  
  console.log(`Successfully downloaded file: ${fileName}`);
  return data;
}

export async function savePrediction(supabase: any, datasetId: string, processedResults: any) {
  console.log(`Saving prediction for dataset: ${datasetId}`);
  
  // Validate the processed results to prevent empty/null values
  const validatedResults = {
    pollutionZones: processedResults.pollutionZones || [],
    routes: processedResults.routes || {},
    mlinsights: processedResults.mlInsights || [], // Note: Using lowercase to match DB column name
    trends: processedResults.trends || [],
    correlations: processedResults.correlations || [],
    predictions: processedResults.predictions || {}
  };
  
  // Make sure to use correct casing for column names to match the database
  const { data, error } = await supabase
    .from('pollution_predictions')
    .insert({
      dataset_id: datasetId,
      predicted_pollution_zones: validatedResults.pollutionZones,
      generated_routes: validatedResults.routes,
      mlinsights: validatedResults.mlinsights, // Note: Using lowercase to match DB column name
      trends: validatedResults.trends,
      correlations: validatedResults.correlations,
      predictions: validatedResults.predictions,
      status: 'Completed'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating prediction:", error);
    throw error;
  }
  
  console.log(`Successfully saved prediction with ID: ${data.id}`);
  return data;
}

export async function updateDatasetWithResults(supabase: any, datasetId: string, dataPreview: any[], columnNames: string[], rowCount: number) {
  console.log(`Updating dataset ${datasetId} with results - Preview rows: ${dataPreview.length}, Columns: ${columnNames.length}, Total rows: ${rowCount}`);
  
  // Ensure dataPreview is valid and not too large for database storage
  // Limit to maximum 5 rows for preview
  const limitedPreview = dataPreview.slice(0, 5);
  
  // Check if data is valid before updating
  if (!limitedPreview || limitedPreview.length === 0) {
    console.error("Invalid data preview, cannot update dataset");
    throw new Error("Invalid data preview");
  }
  
  const { error } = await supabase
    .from('air_quality_datasets')
    .update({
      status: 'Completed',
      data_preview: limitedPreview,
      column_names: columnNames,
      row_count: rowCount
    })
    .eq('id', datasetId);
    
  if (error) {
    console.error("Error updating dataset with results:", error);
    throw error;
  }
  
  console.log(`Successfully updated dataset ${datasetId} with results`);
}
