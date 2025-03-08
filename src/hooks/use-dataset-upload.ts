
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { uploadDatasetFile, processDataset } from '@/services/dataset-service';
import { validateDatasetFile } from '@/utils/dataset-validation';
import { AirQualityDataset } from '@/types/dataset';

export const useDatasetUpload = () => {
  const { user, isSignedIn } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDataset = async (file: File): Promise<AirQualityDataset | null> => {
    if (!isSignedIn || !user) {
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
      
      console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`);

      // Upload file and create dataset record
      const dataset = await uploadDatasetFile(file, user.id);
      
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
        if (error.message.includes('storage')) {
          toast.error('Error uploading file to storage. Please try again.');
        } else if (error.message.includes('database')) {
          toast.error('Error saving dataset information. Please try again.');
        } else if (error.message.includes('processing')) {
          toast.error('Dataset uploaded but processing failed. You can try reprocessing it later.');
        } else if (error.message.includes('permission')) {
          toast.error('Permission denied. Please check your account privileges.');
        } else if (error.message.includes('network')) {
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
