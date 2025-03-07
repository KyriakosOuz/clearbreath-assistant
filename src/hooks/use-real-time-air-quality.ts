
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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

  useEffect(() => {
    const fetchAirQuality = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create a Supabase client
        const supabase = createClient(
          'https://uugdlxzevfyodglfrxdb.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Z2RseHpldmZ5b2RnbGZyeGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjEyODUsImV4cCI6MjA1NDg5NzI4NX0.zUGXkMKIrPa4_5hBXzg2WcQA8t8dHvM4rO4ZpyDJaSQ'
        );
        
        // Default to Thessaloniki if no coordinates provided
        const lat = latitude || 40.6401;
        const lon = longitude || 22.9444;
        
        // Call the Supabase Edge Function
        const { data: waqi, error: waqiError } = await supabase.functions.invoke('waqi-air-quality', {
          body: { lat, lon }
        });
        
        if (waqiError) throw new Error(waqiError.message);
        
        if (!waqi || !waqi.data) {
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
          mainPollutant: waqi.data.dominentpol
        };
        
        setData(aqiData);
      } catch (err) {
        console.error('Error fetching air quality data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch air quality data');
        
        // Fallback to mock data if API fails
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
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately
    fetchAirQuality();
    
    // Then set up interval to fetch every 10 minutes
    const intervalId = setInterval(fetchAirQuality, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [latitude, longitude]);
  
  return { data, isLoading, error };
};
