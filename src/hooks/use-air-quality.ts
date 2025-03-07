
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AirQualityData {
  aqi: number;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  time: string;
  pollutants: {
    [key: string]: number;
  };
  forecast?: {
    hourly: Array<{
      hour: string;
      aqi: number;
      time: string;
      components: {
        [key: string]: number;
      };
    }>;
  };
}

export interface AirQualityLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const useAirQuality = (location?: { lat: number; lon: number }) => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchAirQuality = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data, error } = await supabase.functions.invoke('air-quality', {
        body: {},
        params: { lat: lat.toString(), lon: lon.toString() }
      });

      if (error) {
        throw new Error(error.message);
      }

      setData(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('Failed to fetch air quality data. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch air quality data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data initially and set up refresh interval
  useEffect(() => {
    fetchAirQuality();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchAirQuality, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [location?.lat, location?.lon]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAirQuality,
  };
};
