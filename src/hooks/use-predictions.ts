
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PollutionPrediction, PollutionZone, RoutePoint } from '@/types/dataset';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

export const usePredictions = (datasetId?: string) => {
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch predictions for a specific dataset
  const {
    data: predictions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['predictions', datasetId],
    queryFn: async () => {
      if (!isSignedIn || !datasetId) {
        return [];
      }

      const { data, error } = await supabase
        .from('pollution_predictions')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching predictions:', error);
        throw error;
      }

      // Transform the JSON data to match the PollutionPrediction interface
      return (data || []).map(item => {
        // Parse JSON strings if they're stored as strings in the database
        const parsedPollutionZones = Array.isArray(item.predicted_pollution_zones) 
          ? item.predicted_pollution_zones 
          : [];
          
        const parsedRoutes = typeof item.generated_routes === 'object' && item.generated_routes !== null
          ? item.generated_routes
          : { standard: [], clean: [], pollution_zones: [] };
        
        return {
          id: item.id,
          dataset_id: item.dataset_id,
          predicted_pollution_zones: parsedPollutionZones as unknown as PollutionZone[],
          generated_routes: parsedRoutes as unknown as {
            standard: RoutePoint[];
            clean: RoutePoint[];
            pollution_zones: PollutionZone[];
          },
          status: item.status as PollutionPrediction['status'],
          created_at: item.created_at
        } as PollutionPrediction;
      });
    },
    enabled: isSignedIn && !!datasetId
  });

  // Generate a new prediction
  const generatePrediction = async (datasetId: string): Promise<PollutionPrediction | null> => {
    if (!isSignedIn) {
      toast.error('You must be signed in to generate predictions');
      return null;
    }

    try {
      setIsProcessing(true);

      // First, check if the dataset exists and is completed
      const { data: dataset, error: datasetError } = await supabase
        .from('air_quality_datasets')
        .select('status')
        .eq('id', datasetId)
        .single();

      if (datasetError || !dataset) {
        toast.error('Dataset not found');
        return null;
      }

      if (dataset.status !== 'Completed') {
        toast.error('Dataset must be processed before generating predictions');
        return null;
      }

      // Trigger the processing function
      const { error: processingError } = await supabase.functions.invoke('process-dataset', {
        body: { datasetId }
      });

      if (processingError) {
        console.error('Error processing dataset:', processingError);
        toast.error('Error generating prediction: ' + processingError.message);
        return null;
      }

      toast.success('Prediction generation started');
      queryClient.invalidateQueries({ queryKey: ['predictions', datasetId] });
      
      // Return the latest prediction after a short delay to allow processing
      setTimeout(() => {
        refetch();
      }, 3000);
      
      return null;
    } catch (error) {
      console.error('Unexpected error during prediction generation:', error);
      toast.error('Unexpected error during prediction generation');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete prediction mutation
  const deletePredictionMutation = useMutation({
    mutationFn: async (predictionId: string) => {
      if (!isSignedIn) {
        throw new Error('You must be signed in to delete predictions');
      }

      const { error } = await supabase
        .from('pollution_predictions')
        .delete()
        .eq('id', predictionId);

      if (error) {
        throw new Error(`Error deleting prediction: ${error.message}`);
      }

      return predictionId;
    },
    onSuccess: (predictionId) => {
      toast.success('Prediction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete prediction: ${error.message}`);
    }
  });

  return {
    predictions,
    isLoading,
    error,
    generatePrediction,
    deletePrediction: deletePredictionMutation.mutate,
    isDeleting: deletePredictionMutation.isPending,
    isProcessing,
    refetchPredictions: refetch
  };
};
