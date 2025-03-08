
import React, { useState } from 'react';
import CleanRouteForm from '@/components/CleanRouteForm';
import { CleanRouteMap } from '@/components/CleanRouteMap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function CleanRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRouteSelected = async (origin: string, destination: string, transportMode: string) => {
    setIsLoading(true);
    
    try {
      // Call the clean-route-ai edge function to generate a route
      const { data, error } = await supabase.functions.invoke('clean-route-ai', {
        body: { 
          origin,
          destination,
          transportMode
        }
      });
      
      if (error) {
        console.error('Error generating route:', error);
        toast.error('Failed to generate route');
        return;
      }
      
      if (data && data.prediction_id) {
        toast.success('Route generated successfully');
        
        // Update the URL with the prediction ID
        setSearchParams({ predictionId: data.prediction_id });
      } else {
        toast.error('No route data returned');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clean Route</h1>
          <p className="text-muted-foreground">
            Find the cleanest route based on air quality data
          </p>
        </div>
        
        {!predictionId && <CleanRouteForm onRouteSelected={handleRouteSelected} isLoading={isLoading} />}
        
        <div className="py-4">
          <CleanRouteMap />
        </div>
      </div>
    </div>
  );
}
