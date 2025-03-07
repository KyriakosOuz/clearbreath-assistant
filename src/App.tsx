
import React from 'react';
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
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder-key';

const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
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
