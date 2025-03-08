import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for air quality data
interface Pollutant {
  name: string;
  value: number;
  unit: string;
}

export interface AirQualityData {
  aqi: number;
  location: string;
  updatedAt: string;
  pollutants: {
    'PM2.5'?: number;
    'PM10'?: number;
    'O3'?: number;
    'NO2'?: number;
    'SO2'?: number;
    'CO'?: number;
  };
  category: 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';
  mainPollutant?: string;
  attribution?: Array<{
    name: string;
    url: string;
  }>;
}

// Helper to determine AQI category
const getAqiCategory = (aqi: number): AirQualityData['category'] => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 300) return 'hazardous';
  return 'severe';
};

// Format the updated time
const formatUpdatedTime = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
};

export const useRealTimeAirQuality = (latitude?: number, longitude?: number) => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchAirQuality = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Default to Thessaloniki if no coordinates provided
      const lat = latitude || 40.6401;
      const lon = longitude || 22.9444;
      
      console.log(`Fetching air quality data for: ${lat}, ${lon}`);
      
      // Call the Supabase Edge Function
      const { data: waqi, error: waqiError } = await supabase.functions.invoke('waqi-air-quality', {
        body: { lat, lon }
      });
      
      if (waqiError) {
        console.error('WAQI Edge Function error:', waqiError);
        throw new Error(waqiError.message);
      }
      
      if (!waqi || !waqi.data) {
        console.error('No air quality data returned from WAQI');
        throw new Error('No air quality data returned');
      }
      
      // Parse and format the data
      const aqiData: AirQualityData = {
        aqi: waqi.data.aqi,
        location: waqi.data.city?.name || 'Unknown Location',
        updatedAt: formatUpdatedTime(waqi.data.time?.v || Date.now()),
        pollutants: {
          'PM2.5': waqi.data.iaqi?.pm25?.v,
          'PM10': waqi.data.iaqi?.pm10?.v,
          'O3': waqi.data.iaqi?.o3?.v,
          'NO2': waqi.data.iaqi?.no2?.v,
          'SO2': waqi.data.iaqi?.so2?.v,
          'CO': waqi.data.iaqi?.co?.v
        },
        category: getAqiCategory(waqi.data.aqi),
        mainPollutant: waqi.data.dominentpol,
        attribution: waqi.data.attributions?.map((attr: any) => ({
          name: attr.name,
          url: attr.url
        }))
      };
      
      console.log('Successfully processed air quality data:', aqiData);
      setData(aqiData);
      setLastRefresh(Date.now());
      
      // Show toast for unhealthy air quality
      if (aqiData.category === 'unhealthy' || aqiData.category === 'hazardous' || aqiData.category === 'severe') {
        toast.warning(`Air quality alert for ${aqiData.location}`, {
          description: `AQI is at ${aqiData.aqi} (${aqiData.category}). Consider limiting outdoor activities.`,
          duration: 6000,
        });
      }
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch air quality data');
      
      // If there's no data yet, set fallback mock data
      if (!data) {
        setData({
          aqi: 42,
          location: 'Thessaloniki, City Center',
          updatedAt: '2 minutes ago',
          pollutants: {
            'PM2.5': 12,
            'PM10': 24,
            'O3': 68,
            'NO2': 15
          },
          category: 'good'
        });
      }
      
      // Show error toast
      toast.error('Error fetching air quality data', {
        description: err instanceof Error ? err.message : 'Please try again later',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, data]);
  
  // Force a refresh function that can be called manually
  const refreshData = useCallback(() => {
    fetchAirQuality();
  }, [fetchAirQuality]);
  
  useEffect(() => {
    // Fetch immediately on mount or when coordinates change
    fetchAirQuality();
    
    // Then set up interval to fetch every 10 minutes
    const intervalId = setInterval(fetchAirQuality, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchAirQuality]);
  
  return { 
    data, 
    isLoading, 
    error,
    lastRefresh,
    refreshData 
  };
};
