
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  destination: string;
  transport_mode: string;
  is_favorite: boolean;
  created_at: string;
}

export interface SaveRouteInput {
  name: string;
  origin: string;
  destination: string;
  transport_mode: string;
  is_favorite?: boolean;
}

export const useSavedRoutes = () => {
  const { user, isSignedIn } = useUser();
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedRoutes = async () => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setRoutes(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching saved routes:', err);
      setError('Failed to fetch saved routes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoute = async (input: SaveRouteInput) => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      toast.error('You must be signed in to save routes');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: saveError } = await supabase
        .from('saved_routes')
        .insert({
          user_id: user.id,
          name: input.name,
          origin: input.origin,
          destination: input.destination,
          transport_mode: input.transport_mode,
          is_favorite: input.is_favorite || false
        })
        .select()
        .single();
      
      if (saveError) throw new Error(saveError.message);
      
      setRoutes(prev => [data, ...prev]);
      toast.success('Route saved successfully');
      return data;
    } catch (err) {
      console.error('Error saving route:', err);
      setError('Failed to save route');
      toast.error('Failed to save route');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoute = async (routeId: string) => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('saved_routes')
        .delete()
        .eq('id', routeId)
        .eq('user_id', user.id);
      
      if (deleteError) throw new Error(deleteError.message);
      
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      toast.success('Route deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Failed to delete route');
      toast.error('Failed to delete route');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (routeId: string, isFavorite: boolean) => {
    if (!isSignedIn || !user) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('saved_routes')
        .update({ is_favorite: isFavorite })
        .eq('id', routeId)
        .eq('user_id', user.id);
      
      if (updateError) throw new Error(updateError.message);
      
      setRoutes(prev => prev.map(route => 
        route.id === routeId ? { ...route, is_favorite: isFavorite } : route
      ));
      
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
      return true;
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setError('Failed to update favorite status');
      toast.error('Failed to update favorite status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved routes on component mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetchSavedRoutes();
    }
  }, [isSignedIn, user]);

  return {
    routes,
    isLoading,
    error,
    fetchSavedRoutes,
    saveRoute,
    deleteRoute,
    toggleFavorite
  };
};
