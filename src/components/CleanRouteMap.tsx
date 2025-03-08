
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCleanRouteMap } from '@/hooks/use-clean-route-map';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { MapLoading } from '@/components/map/MapLoading';
import { MapEmptyState } from '@/components/map/MapEmptyState';
import { MapRouteOptions } from '@/components/map/MapRouteOptions';

interface CleanRouteMapProps {
  width?: string;
  height?: string;
  className?: string;
}

export function CleanRouteMap({ width = '100%', height = '600px', className = '' }: CleanRouteMapProps) {
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  const [routeType, setRouteType] = useState<'standard' | 'clean'>('clean');
  
  // Load prediction data
  const { prediction, isLoading } = useCleanRouteMap(predictionId);
  
  // Initialize Google Maps
  useGoogleMaps('clean-route-map', prediction, routeType);
  
  // Handle loading state
  if (isLoading) {
    return <MapLoading width={width} height={height} />;
  }
  
  // Handle no prediction selected
  if (!predictionId) {
    return (
      <MapEmptyState 
        title="No Prediction Selected"
        description="Please select a prediction from your datasets to view the clean route."
        width={width}
        height={height}
      />
    );
  }
  
  // Handle prediction not found
  if (!prediction || !prediction.generated_routes) {
    return (
      <MapEmptyState 
        title="Prediction Not Found"
        description="The selected prediction does not exist or does not contain any route data."
        width={width}
        height={height}
      />
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 right-4 z-10 space-y-4">
        <MapRouteOptions 
          routeType={routeType} 
          onRouteTypeChange={setRouteType}
        />
      </div>
      
      <div 
        id="clean-route-map" 
        className="rounded-lg border overflow-hidden" 
        style={{ width, height }}
      ></div>
    </div>
  );
}
