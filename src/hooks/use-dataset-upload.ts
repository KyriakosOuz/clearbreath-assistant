
import { useState } from 'react';
import { toast } from 'sonner';
import { uploadDatasetFile, processDataset } from '@/services/dataset-service';
import { validateDatasetFile } from '@/utils/dataset-validation';
import { AirQualityDataset } from '@/types/dataset';
import { supabase } from '@/integrations/supabase/client';

export const useDatasetUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDataset = async (file: File): Promise<AirQualityDataset | null> => {
    // Check if user is signed in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error('You must be signed in to upload datasets');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file
      if (!validateDatasetFile(file)) {
        setIsUploading(false);
        return null;
      }

      setUploadProgress(20);
      
      // Log detailed information for debugging
      console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`);
      console.log(`User is signed in: ${!!session}, User ID: ${session.user.id}`);

      // Upload file and create dataset record with explicit user ID
      const dataset = await uploadDatasetFile(file, session.user.id);
      
      console.log(`File uploaded successfully, dataset ID: ${dataset.id}`);
      setUploadProgress(70);

      // Trigger processing
      await processDataset(dataset.id);
      console.log(`Processing started for dataset ID: ${dataset.id}`);
      
      setUploadProgress(100);
      toast.success('Dataset uploaded and processing started');
      
      return dataset;
    } catch (error) {
      console.error('Unexpected error during dataset upload:', error);
      
      // Provide more descriptive error messages
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('violates row-level security')) {
          console.error('RLS error details:', error);
          toast.error('Authorization error: Could not create dataset with your user account. Please try signing out and back in.');
        } else if (errorMsg.includes('storage') || errorMsg.includes('objects')) {
          toast.error('Storage permission error. Please try again or contact support.');
        } else if (errorMsg.includes('database')) {
          toast.error('Error saving dataset information. Please try again.');
        } else if (errorMsg.includes('processing')) {
          toast.error('Dataset uploaded but processing failed. You can try reprocessing it later.');
        } else if (errorMsg.includes('permission')) {
          toast.error('Permission denied. Please check your account privileges.');
        } else if (errorMsg.includes('network')) {
          toast.error('Network error. Please check your internet connection and try again.');
        } else {
          toast.error(`Upload error: ${error.message}`);
        }
      } else {
        toast.error('Unexpected error during dataset upload');
      }
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDataset,
    isUploading,
    uploadProgress
  };
};
