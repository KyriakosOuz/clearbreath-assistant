
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { AirQualityDataset } from '@/types/dataset';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

export const useDatasets = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch datasets
  const {
    data: datasets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      if (!isSignedIn || !isLoaded) {
        return [];
      }

      const { data, error } = await supabase
        .from('air_quality_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching datasets:', error);
        throw error;
      }

      return data as AirQualityDataset[];
    },
    enabled: isLoaded && isSignedIn
  });

  // Upload dataset
  const uploadDataset = async (file: File): Promise<AirQualityDataset | null> => {
    if (!isSignedIn || !user) {
      toast.error('You must be signed in to upload datasets');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !['csv', 'json'].includes(fileExtension)) {
        toast.error('Only CSV and JSON files are supported');
        return null;
      }

      // Generate a unique filename
      const fileName = `${uuidv4()}.${fileExtension}`;

      // First, upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 50);
            setUploadProgress(percent); // We'll use 50% for upload, 50% for processing
          }
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Error uploading file: ' + uploadError.message);
        return null;
      }

      setUploadProgress(50);

      // Then, create a record in the air_quality_datasets table
      const { data: datasetData, error: datasetError } = await supabase
        .from('air_quality_datasets')
        .insert({
          user_id: user.id,
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
        toast.error('Error creating dataset record: ' + datasetError.message);

        // Cleanup the uploaded file if the database record failed
        await supabase.storage.from('datasets').remove([fileName]);
        return null;
      }

      setUploadProgress(75);

      // Trigger the processing of the dataset
      const processingResponse = await supabase.functions.invoke('process-dataset', {
        body: { datasetId: datasetData.id }
      });

      if (processingResponse.error) {
        console.error('Error processing dataset:', processingResponse.error);
        toast.error('Error processing dataset: ' + processingResponse.error.message);
        // We don't need to delete the record, as it will show as 'Failed' in the UI
      } else {
        toast.success('Dataset uploaded and processing started');
      }

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      return datasetData as AirQualityDataset;
    } catch (error) {
      console.error('Unexpected error during dataset upload:', error);
      toast.error('Unexpected error during dataset upload');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete dataset mutation
  const deleteDatasetMutation = useMutation({
    mutationFn: async (datasetId: string) => {
      if (!isSignedIn) {
        throw new Error('You must be signed in to delete datasets');
      }

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
    },
    onSuccess: (datasetId) => {
      toast.success('Dataset deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete dataset: ${error.message}`);
    }
  });

  // Reprocess dataset
  const reprocessDataset = async (datasetId: string): Promise<void> => {
    if (!isSignedIn) {
      toast.error('You must be signed in to reprocess datasets');
      return;
    }

    try {
      // Update the status to Pending
      const { error: updateError } = await supabase
        .from('air_quality_datasets')
        .update({ status: 'Pending' })
        .eq('id', datasetId);

      if (updateError) {
        throw new Error(`Error updating dataset status: ${updateError.message}`);
      }

      // Trigger the processing function
      const { error: processingError } = await supabase.functions.invoke('process-dataset', {
        body: { datasetId }
      });

      if (processingError) {
        throw new Error(`Error processing dataset: ${processingError.message}`);
      }

      toast.success('Dataset reprocessing started');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (error) {
      console.error('Error reprocessing dataset:', error);
      toast.error(`Error reprocessing dataset: ${error.message}`);
    }
  };

  return {
    datasets,
    isLoading,
    error,
    uploadDataset,
    deleteDataset: deleteDatasetMutation.mutate,
    isDeleting: deleteDatasetMutation.isPending,
    reprocessDataset,
    isUploading,
    uploadProgress,
    refetchDatasets: refetch
  };
};
