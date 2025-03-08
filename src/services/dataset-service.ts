
import { supabase } from '@/integrations/supabase/client';
import { AirQualityDataset } from '@/types/dataset';
import { v4 as uuidv4 } from 'uuid';

// Fetch datasets for a user
export const fetchDatasets = async (): Promise<AirQualityDataset[]> => {
  const { data, error } = await supabase
    .from('air_quality_datasets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }

  return data as AirQualityDataset[];
};

// Upload a file to storage and create dataset record
export const uploadDatasetFile = async (
  file: File, 
  userId: string
): Promise<AirQualityDataset> => {
  // Generate a unique filename
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${uuidv4()}.${fileExtension}`;
  
  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('datasets')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  // Create dataset record in database
  const { data: datasetData, error: datasetError } = await supabase
    .from('air_quality_datasets')
    .insert({
      user_id: userId,
      file_name: fileName,
      original_file_name: file.name,
      file_type: fileExtension,
      file_size: file.size,
      status: 'Pending'
    })
    .select('*')
    .single();

  if (datasetError) {
    console.error('Error creating dataset record:', datasetError);
    // Cleanup the uploaded file if the database record failed
    await supabase.storage.from('datasets').remove([fileName]);
    throw datasetError;
  }

  return datasetData as AirQualityDataset;
};

// Trigger processing of a dataset
export const processDataset = async (datasetId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('process-dataset', {
    body: { datasetId }
  });

  if (error) {
    console.error('Error processing dataset:', error);
    throw error;
  }
};

// Delete a dataset and its file
export const deleteDataset = async (datasetId: string): Promise<string> => {
  // First get the dataset to get the filename
  const { data: dataset, error: getError } = await supabase
    .from('air_quality_datasets')
    .select('file_name')
    .eq('id', datasetId)
    .single();

  if (getError) {
    throw new Error(`Error fetching dataset: ${getError.message}`);
  }

  // Delete the record from the database
  const { error: deleteError } = await supabase
    .from('air_quality_datasets')
    .delete()
    .eq('id', datasetId);

  if (deleteError) {
    throw new Error(`Error deleting dataset: ${deleteError.message}`);
  }

  // Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from('datasets')
    .remove([dataset.file_name]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    // We don't throw here as the database record is already deleted
  }

  return datasetId;
};

// Update dataset status to pending (for reprocessing)
export const updateDatasetStatusToPending = async (datasetId: string): Promise<void> => {
  const { error } = await supabase
    .from('air_quality_datasets')
    .update({ status: 'Pending' })
    .eq('id', datasetId);

  if (error) {
    throw new Error(`Error updating dataset status: ${error.message}`);
  }
};
