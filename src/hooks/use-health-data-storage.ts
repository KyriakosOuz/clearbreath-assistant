
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

export interface StoredHealthData {
  id: string;
  user_id: string;
  date: string;
  heart_rate: number | null;
  respiratory_rate: number | null;
  steps: number | null;
  sleep_hours: number | null;
  updated_at: string;
}

export interface HealthDataInput {
  heart_rate?: number;
  respiratory_rate?: number;
  steps?: number;
  sleep_hours?: number;
}

export const useHealthDataStorage = () => {
  const { user, isSignedIn } = useUser();
  const [healthData, setHealthData] = useState<StoredHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async (date?: string) => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error: fetchError } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .maybeSingle();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setHealthData(data);
      return data;
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to fetch health data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveHealthData = async (input: HealthDataInput) => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have data for today
      const existingData = await fetchHealthData(today);
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('health_data')
          .update({
            ...input,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (updateError) throw new Error(updateError.message);
        result = data;
      } else {
        // Insert new record
        const { data, error: insertError } = await supabase
          .from('health_data')
          .insert({
            user_id: user.id,
            date: today,
            ...input
          })
          .select()
          .single();
        
        if (insertError) throw new Error(insertError.message);
        result = data;
      }
      
      setHealthData(result);
      toast.success('Health data saved successfully');
      return result;
    } catch (err) {
      console.error('Error saving health data:', err);
      setError('Failed to save health data');
      toast.error('Failed to save health data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch health data on component mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetchHealthData();
    }
  }, [isSignedIn, user]);

  return {
    healthData,
    isLoading,
    error,
    fetchHealthData,
    saveHealthData
  };
};
