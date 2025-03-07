
import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const SignUp = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <ClerkSignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in" 
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </motion.div>
    </div>
  );
};

export default SignUp;
