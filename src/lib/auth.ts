
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
