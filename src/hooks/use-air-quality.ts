
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOpenWeatherSource, useIQAirSource } from './use-air-quality-sources';
import { combineAirQualityData } from '@/utils/air-quality-combiner';
import { AirQualityData, AirQualityLocation, DataSource } from './use-air-quality-types';

export type { AirQualityData, AirQualityLocation, DataSource };

export const useAirQuality = (
  location?: { lat: number; lon: number },
  options?: { source?: DataSource; interval?: number }
) => {
  const [combinedData, setCombinedData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const openWeatherSource = useOpenWeatherSource();
  const iqairSource = useIQAirSource();

  const source = options?.source || 'combined';
  const interval = options?.interval || 10 * 60 * 1000; // Default to 10 minutes

  // Main function to fetch all data
  const fetchAirQuality = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from both sources in parallel
      const [openWeatherResult, iqairResult] = await Promise.allSettled([
        openWeatherSource.fetchData(location),
        iqairSource.fetchData(location)
      ]);
      
      const openWeatherSuccess = openWeatherResult.status === 'fulfilled' && openWeatherResult.value;
      const iqairSuccess = iqairResult.status === 'fulfilled' && iqairResult.value;
      
      if (!openWeatherSuccess && !iqairSuccess) {
        throw new Error('Failed to fetch air quality data from any source');
      }
      
      // Combine the data
      const owData = openWeatherSuccess ? openWeatherResult.value : null;
      const iqData = iqairSuccess ? iqairResult.value : null;
      
      const combined = combineAirQualityData(owData, iqData);
      setCombinedData(combined);
      
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
  }, [location, openWeatherSource, iqairSource, toast]);

  // Fetch data initially and set up refresh interval
  useEffect(() => {
    fetchAirQuality();

    // Refresh data at the specified interval
    const intervalId = setInterval(fetchAirQuality, interval);

    return () => clearInterval(intervalId);
  }, [fetchAirQuality, interval]);

  // Determine which data to return based on the source option
  const getData = useCallback(() => {
    switch (source) {
      case 'openweather':
        return openWeatherSource.data;
      case 'iqair':
        return iqairSource.data;
      case 'combined':
      default:
        return combinedData;
    }
  }, [source, openWeatherSource.data, iqairSource.data, combinedData]);

  return {
    data: getData(),
    openWeatherData: openWeatherSource.data,
    iqairData: iqairSource.data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAirQuality,
  };
};
