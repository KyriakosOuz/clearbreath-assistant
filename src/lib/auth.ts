
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles sign in with Google OAuth
 * Redirects the user to Google's authentication page
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google", {
        description: error.message,
      });
    }
  } catch (error) {
    console.error("Unexpected error during Google sign in:", error);
    toast.error("An unexpected error occurred", {
      description: "Please try again later",
    });
  }
};

/**
 * Handles sign in with GitHub OAuth
 * Redirects the user to GitHub's authentication page
 */
export const signInWithGitHub = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) {
      console.error("Error signing in with GitHub:", error);
      toast.error("Failed to sign in with GitHub", {
        description: error.message,
      });
    }
  } catch (error) {
    console.error("Unexpected error during GitHub sign in:", error);
    toast.error("An unexpected error occurred", {
      description: "Please try again later",
    });
  }
};

/**
 * Handles sign out
 * Redirects the user to the sign-in page after sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out", {
        description: error.message,
      });
    } else {
      toast.success("Signed out successfully");
      // Redirect to the sign-in page
      window.location.href = "/sign-in";
    }
  } catch (error) {
    console.error("Unexpected error during sign out:", error);
    toast.error("An unexpected error occurred", {
      description: "Please try again later",
    });
  }
};

/**
 * Gets the current session
 * Returns the session or null if not signed in
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Unexpected error getting session:", error);
    return null;
  }
};

/**
 * Gets the current user
 * Returns the user or null if not signed in
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Unexpected error getting user:", error);
    return null;
  }
};
