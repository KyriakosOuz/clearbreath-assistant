
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface MapLoadingProps {
  width?: string;
  height?: string;
}

export function MapLoading({ width = '100%', height = '600px' }: MapLoadingProps) {
  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading route data...</p>
      </div>
    </div>
  );
}
