
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
  attribution?: {
    name: string;
    url: string;
  }[];
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

// Persistent storage for user preferences
const saveUserPreferredLocation = (locationName: string, lat: number, lon: number) => {
  try {
    localStorage.setItem('airQualityPreferredLocation', JSON.stringify({ name: locationName, lat, lon }));
  } catch (e) {
    console.error('Error saving location to localStorage:', e);
  }
};

const getUserPreferredLocation = () => {
  try {
    const savedLocation = localStorage.getItem('airQualityPreferredLocation');
    if (savedLocation) {
      return JSON.parse(savedLocation);
    }
  } catch (e) {
    console.error('Error reading location from localStorage:', e);
  }
  return null;
};

interface UseRealTimeAirQualityOptions {
  disableNotifications?: boolean;
  locationName?: string;
}

export const useRealTimeAirQuality = (
  latitude?: number, 
  longitude?: number, 
  options: UseRealTimeAirQualityOptions = {}
) => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const { disableNotifications = false, locationName } = options;

  const fetchAirQuality = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check for user preferred location first
      const savedLocation = getUserPreferredLocation();
      
      // Default to Thessaloniki if no coordinates or saved location
      let lat = latitude;
      let lon = longitude;
      let location = locationName;
      
      if (!lat || !lon) {
        if (savedLocation) {
          lat = savedLocation.lat;
          lon = savedLocation.lon;
          location = savedLocation.name;
        } else {
          lat = 40.6401;
          lon = 22.9444;
          location = 'Thessaloniki, Greece';
        }
      }
      
      console.log(`Fetching air quality data for: ${location || ''} (${lat}, ${lon})`);
      
      // Call the Supabase Edge Function
      const { data: iqairData, error: iqairError } = await supabase.functions.invoke('iqair-air-quality', {
        body: { lat, lon }
      });
      
      if (iqairError) {
        console.error('IQAir Edge Function error:', iqairError);
        throw new Error(iqairError.message);
      }
      
      if (!iqairData || !iqairData.data) {
        console.error('No air quality data returned from IQAir');
        throw new Error('No air quality data returned');
      }
      
      // Parse and format the data
      const aqiData: AirQualityData = {
        aqi: iqairData.data.aqi,
        location: iqairData.data.city || location || 'Unknown Location',
        updatedAt: formatUpdatedTime(iqairData.data.time || Date.now()),
        pollutants: iqairData.data.pollutants || {
          'PM2.5': 0,
          'PM10': 0
        },
        category: getAqiCategory(iqairData.data.aqi),
        mainPollutant: iqairData.data.dominantPollutant,
        attribution: iqairData.data.attributions
      };
      
      console.log('Successfully processed air quality data:', aqiData);
      setData(aqiData);
      setLastRefresh(Date.now());
      
      // If this is a user-selected location or a saved one, update the storage
      if (locationName && lat && lon) {
        saveUserPreferredLocation(locationName, lat, lon);
      } else if (aqiData.location && lat && lon && !disableNotifications) {
        saveUserPreferredLocation(aqiData.location, lat, lon);
      }
      
      // Only show notifications for unhealthy air if this is the preferred location and notifications aren't disabled
      const preferredLocation = getUserPreferredLocation();
      const isPreferredLocation = preferredLocation && 
        preferredLocation.lat === lat && 
        preferredLocation.lon === lon;
      
      if (!disableNotifications && 
          isPreferredLocation &&
          (aqiData.category === 'unhealthy' || aqiData.category === 'hazardous' || aqiData.category === 'severe')) {
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
        const savedLocation = getUserPreferredLocation();
        
        setData({
          aqi: 42,
          location: savedLocation?.name || 'Thessaloniki, City Center',
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
      
      // Show error toast (but not for mock data scenario)
      if (data && !disableNotifications) {
        toast.error('Error fetching air quality data', {
          description: err instanceof Error ? err.message : 'Please try again later',
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, data, disableNotifications, locationName]);
  
  // Force a refresh function that can be called manually
  const refreshData = useCallback(() => {
    fetchAirQuality();
  }, [fetchAirQuality]);
  
  // Set a user's preferred location
  const setPreferredLocation = useCallback((name: string, lat: number, lon: number) => {
    saveUserPreferredLocation(name, lat, lon);
    refreshData();
  }, [refreshData]);
  
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
    refreshData,
    setPreferredLocation 
  };
};
