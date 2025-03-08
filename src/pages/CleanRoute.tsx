
import React, { useState } from 'react';
import CleanRouteForm from '@/components/CleanRouteForm';
import { CleanRouteMap } from '@/components/CleanRouteMap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function CleanRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRouteSelected = (origin: string, destination: string, transportMode: string) => {
    setIsLoading(true);
    
    // Simulate route processing
    setTimeout(() => {
      toast.success('Route generated successfully');
      setIsLoading(false);
    }, 1500);
    
    // In a real implementation, you would call an API to generate the route
    console.log('Route selected:', { origin, destination, transportMode });
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
