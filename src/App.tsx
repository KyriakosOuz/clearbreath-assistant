
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/clerk-react';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import AirQuality from '@/pages/AirQuality';
import Map from '@/pages/Map';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';
import CleanRoute from '@/pages/CleanRoute';

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if it's a valid publishable key format (starts with pk_)
const isValidKey = typeof clerkPubKey === 'string' && clerkPubKey.startsWith('pk_');

const App = () => {
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Log to help with debugging
    if (!isValidKey) {
      console.log('Invalid or missing Clerk publishable key');
      setAuthError(true);
    }
  }, []);

  // Create a version of the app without Clerk if the key is invalid
  if (!isValidKey || authError) {
    return (
      <BrowserRouter>
        <div className={cn("relative min-h-screen")}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/air-quality" element={<AirQuality />} />
            <Route path="/map" element={<Map />} />
            <Route path="/clean-route" element={<CleanRoute />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    );
  }

  // Normal app flow with Clerk authentication
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          card: 'bg-background shadow-lg',
        }
      }}
    >
      <BrowserRouter>
        <div className={cn("relative min-h-screen")}>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/air-quality" element={<AirQuality />} />
            <Route path="/map" element={<Map />} />
            <Route path="/clean-route" element={<CleanRoute />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App;
