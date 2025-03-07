
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import { useHealthDataStorage, StoredHealthData } from './use-health-data-storage';

export interface HealthData {
  heartRate: number;
  oxygenLevel: number;
  steps?: number;
  stressLevel?: number;
  lastUpdated: string;
  connected: boolean;
  deviceType?: 'GoogleFit' | 'HuaweiHealth' | 'AppleHealth' | 'Manual';
}

export interface HealthRecommendation {
  text: string;
  isEmergency: boolean;
  timestamp: string;
}

export const useHealthData = (aqiLevel: number, pollutants: { [key: string]: number }) => {
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 75,
    oxygenLevel: 98,
    steps: 0,
    stressLevel: 2,
    lastUpdated: new Date().toISOString(),
    connected: false
  });
  const [recommendation, setRecommendation] = useState<HealthRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();
  
  // Connect to our Supabase stored health data
  const { 
    healthData: storedHealthData,
    saveHealthData,
    isLoading: isStorageLoading
  } = useHealthDataStorage();

  // Update from stored data when available
  useEffect(() => {
    if (storedHealthData) {
      setHealthData(prevData => ({
        ...prevData,
        heartRate: storedHealthData.heart_rate || prevData.heartRate,
        // Map respiratory_rate from database to oxygenLevel in UI
        oxygenLevel: storedHealthData.respiratory_rate || prevData.oxygenLevel,
        steps: storedHealthData.steps || prevData.steps,
        // Map sleep_hours to stressLevel (as a proxy for now)
        stressLevel: storedHealthData.sleep_hours ? Math.floor(10 - storedHealthData.sleep_hours) : prevData.stressLevel,
        lastUpdated: storedHealthData.updated_at,
        connected: true,
        deviceType: 'Manual'
      }));
    }
  }, [storedHealthData]);

  // Get AI recommendations based on health and air quality data
  const getRecommendation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: responseData, error: responseError } = await supabase.functions.invoke('health-analysis', {
        body: { 
          healthData: {
            heartRate: healthData.heartRate,
            oxygenLevel: healthData.oxygenLevel,
            steps: healthData.steps,
            stressLevel: healthData.stressLevel,
            aqiLevel,
            pollutants
          } 
        }
      });

      if (responseError) throw new Error(responseError.message);
      
      setRecommendation(responseData);
      
      // Show toast notification for emergencies
      if (responseData.isEmergency) {
        toast({
          variant: "emergency",
          title: "HEALTH ALERT",
          description: responseData.text.substring(0, 100) + "..."
        });
      }
      
    } catch (err) {
      console.error('Error getting health recommendation:', err);
      setError('Failed to get health recommendation. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get health recommendation."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically get recommendations when health data or AQI changes significantly
  useEffect(() => {
    // Check if AQI is in unhealthy range or heart rate/oxygen level is concerning
    const isUnhealthyAQI = aqiLevel > 100;
    const isConcerningHealth = healthData.heartRate > 100 || healthData.oxygenLevel < 95;
    
    if (isUnhealthyAQI || isConcerningHealth) {
      getRecommendation();
    }
  }, [aqiLevel, healthData.heartRate, healthData.oxygenLevel]);

  // Connect to a new smartwatch or health device
  const connectDevice = async (deviceType: 'GoogleFit' | 'HuaweiHealth' | 'AppleHealth') => {
    // In a real implementation, this would use the device's API
    // For now, we'll simulate the connection
    
    // Generate some realistic health data
    const newHeartRate = Math.floor(Math.random() * 20) + 65; // 65-85 range
    const newOxygenLevel = Math.floor(Math.random() * 5) + 95; // 95-99 range
    const newSteps = Math.floor(Math.random() * 5000) + 2000; // 2000-7000 range
    const newStressLevel = Math.floor(Math.random() * 5) + 1; // 1-5 range
    
    const updatedData = {
      heartRate: newHeartRate,
      oxygenLevel: newOxygenLevel,
      steps: newSteps,
      stressLevel: newStressLevel,
      lastUpdated: new Date().toISOString(),
      connected: true,
      deviceType
    };
    
    setHealthData(updatedData);
    
    // Save to database if user is signed in
    if (isSignedIn && user) {
      await saveHealthData({
        heart_rate: newHeartRate,
        respiratory_rate: newOxygenLevel,
        steps: newSteps,
        sleep_hours: 10 - newStressLevel // Convert stress level to sleep hours
      });
    }
    
    toast({
      title: "Device Connected",
      description: `Successfully connected to ${deviceType}`,
    });
  };

  // Disconnect from current device
  const disconnectDevice = () => {
    setHealthData({
      ...healthData,
      connected: false,
      deviceType: undefined
    });
    
    toast({
      title: "Device Disconnected",
      description: "Smartwatch has been disconnected"
    });
  };

  // Update health data manually (for testing or when no device is connected)
  const updateHealthData = async (newData: Partial<HealthData>) => {
    const updatedData = {
      ...healthData,
      ...newData,
      lastUpdated: new Date().toISOString(),
      deviceType: healthData.deviceType || 'Manual'
    };
    
    setHealthData(updatedData);
    
    // Save to database if user is signed in
    if (isSignedIn && user) {
      await saveHealthData({
        heart_rate: updatedData.heartRate,
        respiratory_rate: updatedData.oxygenLevel,
        steps: updatedData.steps,
        sleep_hours: updatedData.stressLevel ? 10 - updatedData.stressLevel : undefined
      });
    }
  };

  return {
    healthData,
    recommendation,
    isLoading: isLoading || isStorageLoading,
    error,
    connectDevice,
    disconnectDevice,
    updateHealthData,
    getRecommendation
  };
};
