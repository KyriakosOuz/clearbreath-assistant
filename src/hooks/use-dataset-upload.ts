
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
        return null;
      }

      setUploadProgress(25);

      // Upload file and create dataset record
      const dataset = await uploadDatasetFile(file, user.id);

      setUploadProgress(75);

      // Trigger processing
      await processDataset(dataset.id);
      
      setUploadProgress(100);
      toast.success('Dataset uploaded and processing started');
      
      return dataset;
    } catch (error) {
      console.error('Unexpected error during dataset upload:', error);
      toast.error('Unexpected error during dataset upload');
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
