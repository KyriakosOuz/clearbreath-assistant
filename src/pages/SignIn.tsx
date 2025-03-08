
import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth';

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
        
        <div className="mb-6 space-y-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={signInWithGoogle}
          >
            <FaGoogle className="text-red-500" />
            <span>Sign in with Google</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={signInWithGitHub}
          >
            <FaGithub className="text-black" />
            <span>Sign in with GitHub</span>
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>
        
        <ClerkSignIn 
          routing="path" 
          path="/sign-in" 
          signUpUrl="/sign-up" 
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </motion.div>
    </div>
  );
};

export default SignIn;
