
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Mock data - in a real implementation, these would come from the smartwatch APIs
const mockHealthData: HealthData = {
  heartRate: 78,
  oxygenLevel: 97,
  steps: 6500,
  stressLevel: 3,
  lastUpdated: new Date().toISOString(),
  connected: true,
  deviceType: 'GoogleFit'
};

export const useHealthData = (aqiLevel: number, pollutants: { [key: string]: number }) => {
  const [healthData, setHealthData] = useState<HealthData>(mockHealthData);
  const [recommendation, setRecommendation] = useState<HealthRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate fetching health data from a smartwatch
  useEffect(() => {
    // In a real implementation, this would connect to Google Fit or Huawei Health APIs
    const fetchHealthData = () => {
      // Mock data updates to simulate real-time changes
      const newHeartRate = Math.floor(Math.random() * 30) + 65; // 65-95 range
      const newOxygenLevel = Math.floor(Math.random() * 5) + 94; // 94-99 range
      
      setHealthData({
        ...mockHealthData,
        heartRate: newHeartRate,
        oxygenLevel: newOxygenLevel,
        lastUpdated: new Date().toISOString()
      });
    };

    // Fetch initial data
    fetchHealthData();
    
    // Update health data every 30 seconds
    const intervalId = setInterval(fetchHealthData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

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
          description: responseData.recommendation.substring(0, 100) + "..."
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

  // Connect to a new smartwatch or health device (stub implementation)
  const connectDevice = (deviceType: 'GoogleFit' | 'HuaweiHealth' | 'AppleHealth') => {
    setHealthData({
      ...healthData,
      connected: true,
      deviceType
    });
    
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
  const updateHealthData = (newData: Partial<HealthData>) => {
    setHealthData({
      ...healthData,
      ...newData,
      lastUpdated: new Date().toISOString(),
      deviceType: healthData.deviceType || 'Manual'
    });
  };

  return {
    healthData,
    recommendation,
    isLoading,
    error,
    connectDevice,
    disconnectDevice,
    updateHealthData,
    getRecommendation
  };
};
