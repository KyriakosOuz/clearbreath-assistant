
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home, BarChart, MapPin, MessageSquare, Navigation, Wind } from 'lucide-react';

import { useTheme } from '@/hooks/use-theme';
import Navigation from '@/components/Navigation';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Map from '@/pages/Map';
import Chat from '@/pages/Chat';
import CleanRoute from '@/pages/CleanRoute';
import NotFound from '@/pages/NotFound';
import './index.css';
import AirQualityPage from './pages/AirQuality';

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="app-container">
      <Navigation />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/clean-route" element={<CleanRoute />} />
          <Route path="/air-quality" element={<AirQualityPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
};

export default App;
