
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

/**
 * A hook that protects routes requiring authentication.
 * Redirects to sign-in page if user is not authenticated.
 * 
 * @param redirectUrl The URL to redirect to if not authenticated
 */
export const useAuthProtect = (redirectUrl: string = '/sign-in') => {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.error('You need to be signed in to access this page');
      navigate(redirectUrl);
    }
  }, [isLoaded, isSignedIn, navigate, redirectUrl]);

  return { isLoaded, isSignedIn };
};
