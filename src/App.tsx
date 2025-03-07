import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import AirQuality from '@/pages/AirQuality';
import Map from '@/pages/Map';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';
import CleanRoute from '@/pages/CleanRoute';

const App = () => {
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
};

export default App;
