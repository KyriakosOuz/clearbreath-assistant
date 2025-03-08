
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { useRealTimeAirQuality } from '@/hooks/use-real-time-air-quality';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PreferredLocationBadgeProps {
  className?: string;
}

export function PreferredLocationBadge({ className }: PreferredLocationBadgeProps) {
  const { data, isLoading } = useRealTimeAirQuality();
  const navigate = useNavigate();
  
  const getAQITextColor = (aqi: number): string => {
    if (aqi <= 50) return 'text-green-600 bg-green-50';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-50';
    if (aqi <= 150) return 'text-orange-600 bg-orange-50';
    if (aqi <= 300) return 'text-red-600 bg-red-50';
    return 'text-purple-600 bg-purple-50';
  };
  
  const handleChangeLocation = () => {
    toast.info('Tip: Click on a location pin to select it, then click "Set as Preferred"');
    navigate('/map');
  };
  
  if (isLoading) {
    return (
      <div className={cn('flex flex-col space-y-2', className)}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }
  
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="flex items-center text-sm text-muted-foreground">
        <MapPin className="mr-1 h-3.5 w-3.5" />
        <span>Preferred Location</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {data ? (
          <>
            <Badge 
              variant="outline" 
              className={cn('px-3 py-1 font-medium', 
                data.aqi ? getAQITextColor(data.aqi) : ''
              )}
            >
              {data.location}
            </Badge>
            
            <Button size="sm" variant="ghost" onClick={handleChangeLocation}>
              Change
            </Button>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">No location set</span>
            <Button size="sm" variant="outline" onClick={handleChangeLocation}>
              Set Location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
