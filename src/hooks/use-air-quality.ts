
import { useState, useEffect, useCallback } from 'react';
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
  source?: string;
  station?: string;
  pollutants: {
    [key: string]: number;
  };
  dominantPollutant?: string | null;
  attributions?: Array<{name: string, url: string}>;
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

export type DataSource = 'openweather' | 'iqair' | 'combined';

export const useAirQuality = (
  location?: { lat: number; lon: number },
  options?: { source?: DataSource; interval?: number }
) => {
  const [openWeatherData, setOpenWeatherData] = useState<AirQualityData | null>(null);
  const [iqairData, setIqairData] = useState<AirQualityData | null>(null);
  const [combinedData, setCombinedData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const source = options?.source || 'combined';
  const interval = options?.interval || 10 * 60 * 1000; // Default to 10 minutes

  // Function to fetch data from OpenWeather API
  const fetchOpenWeatherData = useCallback(async () => {
    try {
      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data, error } = await supabase.functions.invoke('air-quality', {
        body: { lat: lat.toString(), lon: lon.toString() }
      });

      if (error) {
        throw new Error(error.message);
      }

      setOpenWeatherData({
        ...data.data,
        source: 'OpenWeather'
      });
      
      return data.data;
    } catch (err) {
      console.error('Error fetching OpenWeather air quality data:', err);
      return null;
    }
  }, [location?.lat, location?.lon]);

  // Function to fetch data from IQAir API
  const fetchIqairData = useCallback(async () => {
    try {
      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data, error } = await supabase.functions.invoke('iqair-air-quality', {
        body: { lat: lat.toString(), lon: lon.toString() }
      });

      if (error) {
        throw new Error(error.message);
      }

      setIqairData(data.data);
      
      return data.data;
    } catch (err) {
      console.error('Error fetching IQAir air quality data:', err);
      return null;
    }
  }, [location?.lat, location?.lon]);

  // Function to combine both data sources
  const combineData = useCallback((openWeatherData: AirQualityData | null, iqairData: AirQualityData | null) => {
    if (!openWeatherData && !iqairData) return null;
    
    // If we only have one data source, use that
    if (!openWeatherData) return iqairData;
    if (!iqairData) return openWeatherData;
    
    // Combine data, giving preference to IQAir for AQI as it's from stations
    // And using OpenWeather for forecast and other details
    const combined: AirQualityData = {
      aqi: iqairData.aqi, // Prefer IQAir for current AQI
      city: iqairData.city || openWeatherData.city,
      coordinates: iqairData.coordinates || openWeatherData.coordinates,
      time: new Date().toISOString(), // Use current time for combined data
      source: 'Combined (IQAir + OpenWeather)',
      station: iqairData.station,
      // Combine pollutants, prefer IQAir values when available
      pollutants: {
        ...openWeatherData.pollutants,
        ...iqairData.pollutants
      },
      dominantPollutant: iqairData.dominantPollutant,
      attributions: iqairData.attributions,
      // Use OpenWeather for forecast as it's more reliable for predictions
      forecast: openWeatherData.forecast
    };
    
    return combined;
  }, []);

  // Main function to fetch all data
  const fetchAirQuality = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from both sources in parallel
      const [openWeatherResult, iqairResult] = await Promise.allSettled([
        fetchOpenWeatherData(),
        fetchIqairData()
      ]);
      
      const openWeatherSuccess = openWeatherResult.status === 'fulfilled' && openWeatherResult.value;
      const iqairSuccess = iqairResult.status === 'fulfilled' && iqairResult.value;
      
      if (!openWeatherSuccess && !iqairSuccess) {
        throw new Error('Failed to fetch air quality data from any source');
      }
      
      // Combine the data
      const owData = openWeatherSuccess ? openWeatherResult.value : null;
      const iqData = iqairSuccess ? iqairResult.value : null;
      
      const combined = combineData(owData, iqData);
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
  }, [fetchOpenWeatherData, fetchIqairData, combineData, toast]);

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
        return openWeatherData;
      case 'iqair':
        return iqairData;
      case 'combined':
      default:
        return combinedData;
    }
  }, [source, openWeatherData, iqairData, combinedData]);

  return {
    data: getData(),
    openWeatherData,
    iqairData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAirQuality,
  };
};
