
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * A hook that protects routes requiring authentication.
 * Redirects to sign-in page if user is not authenticated.
 * 
 * @param redirectUrl The URL to redirect to if not authenticated
 */
export const useAuthProtect = (redirectUrl: string = '/sign-in') => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth:', error);
      }
      
      setIsSignedIn(!!session);
      setIsLoaded(true);
      
      if (!session) {
        toast.error('You need to be signed in to access this page');
        navigate(redirectUrl);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
      setIsLoaded(true);
      
      if (!session && isLoaded) {
        toast.error('You need to be signed in to access this page');
        navigate(redirectUrl);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectUrl]);

  return { isLoaded, isSignedIn };
};
