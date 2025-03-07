
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

export type DataSource = 'openweather' | 'waqi' | 'combined';

export const useAirQuality = (
  location?: { lat: number; lon: number },
  options?: { source?: DataSource; interval?: number }
) => {
  const [openWeatherData, setOpenWeatherData] = useState<AirQualityData | null>(null);
  const [waqiData, setWaqiData] = useState<AirQualityData | null>(null);
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

  // Function to fetch data from WAQI API
  const fetchWaqiData = useCallback(async () => {
    try {
      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data, error } = await supabase.functions.invoke('waqi-air-quality', {
        body: { lat: lat.toString(), lon: lon.toString() }
      });

      if (error) {
        throw new Error(error.message);
      }

      setWaqiData(data.data);
      
      return data.data;
    } catch (err) {
      console.error('Error fetching WAQI air quality data:', err);
      return null;
    }
  }, [location?.lat, location?.lon]);

  // Function to combine both data sources
  const combineData = useCallback((openWeatherData: AirQualityData | null, waqiData: AirQualityData | null) => {
    if (!openWeatherData && !waqiData) return null;
    
    // If we only have one data source, use that
    if (!openWeatherData) return waqiData;
    if (!waqiData) return openWeatherData;
    
    // Combine data, giving preference to WAQI for AQI as it's from stations
    // And using OpenWeather for forecast and other details
    const combined: AirQualityData = {
      aqi: waqiData.aqi, // Prefer WAQI for current AQI
      city: waqiData.city || openWeatherData.city,
      coordinates: waqiData.coordinates || openWeatherData.coordinates,
      time: new Date().toISOString(), // Use current time for combined data
      source: 'Combined (WAQI + OpenWeather)',
      station: waqiData.station,
      // Combine pollutants, prefer WAQI values when available
      pollutants: {
        ...openWeatherData.pollutants,
        ...waqiData.pollutants
      },
      dominantPollutant: waqiData.dominantPollutant,
      attributions: waqiData.attributions,
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
      const [openWeatherResult, waqiResult] = await Promise.allSettled([
        fetchOpenWeatherData(),
        fetchWaqiData()
      ]);
      
      const openWeatherSuccess = openWeatherResult.status === 'fulfilled' && openWeatherResult.value;
      const waqiSuccess = waqiResult.status === 'fulfilled' && waqiResult.value;
      
      if (!openWeatherSuccess && !waqiSuccess) {
        throw new Error('Failed to fetch air quality data from any source');
      }
      
      // Combine the data
      const owData = openWeatherSuccess ? openWeatherResult.value : null;
      const wqData = waqiSuccess ? waqiResult.value : null;
      
      const combined = combineData(owData, wqData);
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
  }, [fetchOpenWeatherData, fetchWaqiData, combineData, toast]);

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
      case 'waqi':
        return waqiData;
      case 'combined':
      default:
        return combinedData;
    }
  }, [source, openWeatherData, waqiData, combinedData]);

  return {
    data: getData(),
    openWeatherData,
    waqiData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAirQuality,
  };
};
