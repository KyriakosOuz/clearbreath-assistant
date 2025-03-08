
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import CleanRoute from '@/pages/CleanRoute';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import NotFound from '@/pages/NotFound';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import Datasets from '@/pages/Datasets';

// Create a client for React Query
const queryClient = new QueryClient();

const AppContent = () => {
  const { collapsed } = useSidebar();
  
  return (
    <div className={cn(
      "relative min-h-screen transition-all duration-300",
      collapsed ? "pl-[70px] md:pl-[80px]" : "pl-0 md:pl-64"
    )}>
      <Navigation />
      <main className="w-full p-4">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/clean-route" element={<CleanRoute />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  // Wrap the entire app with QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
