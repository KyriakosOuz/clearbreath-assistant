
// Supabase client and operations

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or service role key");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function updateDatasetStatus(supabase: any, datasetId: string, status: string) {
  const { error } = await supabase
    .from('air_quality_datasets')
    .update({ status })
    .eq('id', datasetId);
    
  if (error) {
    console.error(`Error updating dataset status to ${status}:`, error);
    throw error;
  }
}

export async function fetchDataset(supabase: any, datasetId: string) {
  const { data, error } = await supabase
    .from('air_quality_datasets')
    .select('*')
    .eq('id', datasetId)
    .single();
    
  if (error || !data) {
    console.error("Error fetching dataset:", error);
    throw error || new Error("Dataset not found");
  }
  
  return data;
}

export async function downloadFile(supabase: any, fileName: string) {
  const { data, error } = await supabase
    .storage
    .from('datasets')
    .download(fileName);
    
  if (error || !data) {
    console.error("Error downloading file:", error);
    throw error || new Error("File not found");
  }
  
  return data;
}

export async function savePrediction(supabase: any, datasetId: string, processedResults: any) {
  const { data, error } = await supabase
    .from('pollution_predictions')
    .insert({
      dataset_id: datasetId,
      predicted_pollution_zones: processedResults.pollutionZones,
      generated_routes: processedResults.routes,
      status: 'Completed'
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating prediction:", error);
    throw error;
  }
  
  return data;
}

export async function updateDatasetWithResults(supabase: any, datasetId: string, dataPreview: any[], columnNames: string[], rowCount: number) {
  const { error } = await supabase
    .from('air_quality_datasets')
    .update({
      status: 'Completed',
      data_preview: dataPreview,
      column_names: columnNames,
      row_count: rowCount
    })
    .eq('id', datasetId);
    
  if (error) {
    console.error("Error updating dataset with results:", error);
    throw error;
  }
}
