
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AirQualityData } from './use-air-quality-types';

// Function to fetch data from OpenWeather API
export const useOpenWeatherSource = () => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (location?: { lat: number; lon: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data: responseData, error: responseError } = await supabase.functions.invoke('air-quality', {
        body: { lat: lat.toString(), lon: lon.toString() }
      });

      if (responseError) {
        throw new Error(responseError.message);
      }

      const formattedData = {
        ...responseData.data,
        source: 'OpenWeather'
      };
      
      setData(formattedData);
      return formattedData;
    } catch (err) {
      console.error('Error fetching OpenWeather air quality data:', err);
      setError('Failed to fetch OpenWeather data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchData };
};

// Function to fetch data from IQAir API
export const useIQAirSource = () => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (location?: { lat: number; lon: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const lat = location?.lat || 40.6403; // Default to Thessaloniki
      const lon = location?.lon || 22.9439;

      const { data: responseData, error: responseError } = await supabase.functions.invoke('iqair-air-quality', {
        body: { lat: lat.toString(), lon: lon.toString() }
      });

      if (responseError) {
        throw new Error(responseError.message);
      }

      setData(responseData.data);
      return responseData.data;
    } catch (err) {
      console.error('Error fetching IQAir air quality data:', err);
      setError('Failed to fetch IQAir data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchData };
};
