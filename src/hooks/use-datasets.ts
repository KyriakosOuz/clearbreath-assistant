
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchDatasets, deleteDataset, processDataset, updateDatasetStatusToPending } from '@/services/dataset-service';
import { useDatasetUpload } from '@/hooks/use-dataset-upload';
import { AirQualityDataset } from '@/types/dataset';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const useDatasets = () => {
  const queryClient = useQueryClient();
  const { uploadDataset, isUploading, uploadProgress } = useDatasetUpload();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
      setIsLoaded(true);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
      setIsLoaded(true);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
