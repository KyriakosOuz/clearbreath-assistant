
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PollutionPrediction, PollutionZone, RoutePoint } from '@/types/dataset';
import { toast } from 'sonner';

export function useCleanRouteMap(predictionId: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState<PollutionPrediction | null>(null);
  
  // Load the prediction data
  useEffect(() => {
    const loadPrediction = async () => {
      if (!predictionId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('pollution_predictions')
          .select('*')
          .eq('id', predictionId)
          .single();
          
        if (error) {
          console.error('Error loading prediction:', error);
          toast.error('Error loading prediction data');
          return;
        }
        
        // Transform the data into the right shape
        if (data) {
          const parsedPollutionZones = Array.isArray(data.predicted_pollution_zones) 
            ? data.predicted_pollution_zones 
            : [];
            
          const parsedRoutes = typeof data.generated_routes === 'object' && data.generated_routes !== null
            ? data.generated_routes
            : { standard: [], clean: [], pollution_zones: [] };
          
          const formattedPrediction: PollutionPrediction = {
            id: data.id,
            dataset_id: data.dataset_id,
            predicted_pollution_zones: parsedPollutionZones as unknown as PollutionZone[],
            generated_routes: parsedRoutes as unknown as {
              standard: RoutePoint[];
              clean: RoutePoint[];
              pollution_zones: PollutionZone[];
            },
            status: data.status as PollutionPrediction['status'],
            created_at: data.created_at
          };
          
          setPrediction(formattedPrediction);
        }
      } catch (error) {
        console.error('Error loading prediction:', error);
        toast.error('Failed to load prediction data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrediction();
  }, [predictionId]);

  return { prediction, isLoading };
}
