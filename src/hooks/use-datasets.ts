
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { fetchDatasets, deleteDataset, processDataset, updateDatasetStatusToPending } from '@/services/dataset-service';
import { useDatasetUpload } from '@/hooks/use-dataset-upload';
import { AirQualityDataset } from '@/types/dataset';

export const useDatasets = () => {
  const { isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const { uploadDataset, isUploading, uploadProgress } = useDatasetUpload();

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
      return fetchDatasets();
    },
    enabled: isLoaded && isSignedIn
  });

  // Delete dataset mutation
  const deleteDatasetMutation = useMutation({
    mutationFn: deleteDataset,
    onSuccess: () => {
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
      await updateDatasetStatusToPending(datasetId);
      
      // Trigger the processing function
      await processDataset(datasetId);

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
