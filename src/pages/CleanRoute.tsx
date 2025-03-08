
import React from 'react';
import { Container } from '@/components/ui/container';
import { CleanRouteForm } from '@/components/CleanRouteForm';
import { CleanRouteMap } from '@/components/CleanRouteMap';
import { useSearchParams } from 'react-router-dom';

export default function CleanRoute() {
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  
  return (
    <Container>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clean Route</h1>
          <p className="text-muted-foreground">
            Find the cleanest route based on air quality data
          </p>
        </div>
        
        {!predictionId && <CleanRouteForm />}
        
        <div className="py-4">
          <CleanRouteMap />
        </div>
      </div>
    </Container>
  );
}
