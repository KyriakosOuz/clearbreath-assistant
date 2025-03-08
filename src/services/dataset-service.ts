
import { supabase } from '@/integrations/supabase/client';
import { AirQualityDataset } from '@/types/dataset';
import { v4 as uuidv4 } from 'uuid';

// Fetch datasets for a user
export const fetchDatasets = async (): Promise<AirQualityDataset[]> => {
  try {
    const { data, error } = await supabase
      .from('air_quality_datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching datasets:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data as AirQualityDataset[];
  } catch (error) {
    console.error('Unexpected error in fetchDatasets:', error);
    throw error;
  }
};

// Create a storage bucket if it doesn't exist
const ensureStorageBucket = async (): Promise<void> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      throw new Error(`Storage error: ${bucketError.message}`);
    }
    
    // If 'datasets' bucket doesn't exist, create it
    if (!buckets?.find(b => b.name === 'datasets')) {
      console.log('Creating datasets bucket...');
      const { error: createError } = await supabase.storage.createBucket('datasets', {
        public: false,
        fileSizeLimit: 10485760, // 10MB in bytes
      });
      
      if (createError) {
        console.error('Error creating datasets bucket:', createError);
        throw new Error(`Storage error: ${createError.message}`);
      }
      
      console.log('Datasets bucket created successfully');
    } else {
      console.log('Datasets bucket already exists');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    throw error;
  }
};

// Upload a file to storage and create dataset record
export const uploadDatasetFile = async (
  file: File, 
  userId: string
): Promise<AirQualityDataset> => {
  try {
    // Ensure datasets bucket exists
    await ensureStorageBucket();
    
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    console.log(`Uploading file to storage: ${fileName}`);
    
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets?.map(b => b.name));
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
      }
      
      // Upload file to storage with retries
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw new Error(`Storage error: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully, creating database record');
    } catch (uploadError) {
      console.error('Caught error during storage upload:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
    }

    try {
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
        throw new Error(`Database error: ${datasetError.message}`);
      }
      
      console.log('Dataset record created successfully:', datasetData.id);
      return datasetData as AirQualityDataset;
    } catch (dbError) {
      console.error('Caught error during database record creation:', dbError);
      // Try to clean up the uploaded file
      try {
        await supabase.storage.from('datasets').remove([fileName]);
      } catch (cleanupError) {
        console.error('Failed to clean up storage file after database error:', cleanupError);
      }
      throw new Error(`Database record creation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Unexpected error during dataset upload:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Trigger processing of a dataset
export const processDataset = async (datasetId: string): Promise<void> => {
  try {
    console.log(`Triggering processing for dataset: ${datasetId}`);
    
    const { error } = await supabase.functions.invoke('process-dataset', {
      body: { datasetId }
    });

    if (error) {
      console.error('Error processing dataset:', error);
      throw new Error(`Dataset processing failed: ${error.message}`);
    }
    
    console.log(`Processing request submitted successfully for dataset: ${datasetId}`);
  } catch (error) {
    console.error('Error in processDataset:', error);
    throw new Error(`Processing request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete a dataset and its file
export const deleteDataset = async (datasetId: string): Promise<string> => {
  try {
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
  } catch (error) {
    console.error('Error in deleteDataset:', error);
    throw error;
  }
};

// Update dataset status to pending (for reprocessing)
export const updateDatasetStatusToPending = async (datasetId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('air_quality_datasets')
      .update({ status: 'Pending' })
      .eq('id', datasetId);

    if (error) {
      throw new Error(`Error updating dataset status: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateDatasetStatusToPending:', error);
    throw error;
  }
};
