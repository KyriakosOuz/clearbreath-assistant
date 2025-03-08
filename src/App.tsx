
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/clerk-react';
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

// Set the Clerk publishable key
const clerkPubKey = "pk_test_ZmVhc2libGUtbWFybW90LTg4LmNsZXJrLmFjY291bnRzLmRldiQ";

// Check if it's a valid publishable key format (starts with pk_)
const isValidKey = typeof clerkPubKey === 'string' && clerkPubKey.startsWith('pk_');

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
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Log to help with debugging
    if (!isValidKey) {
      console.log('Invalid or missing Clerk publishable key');
      setAuthError(true);
    }
  }, []);

  // Wrap the entire app with QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
      {!isValidKey || authError ? (
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      ) : (
        <ClerkProvider 
          publishableKey={clerkPubKey}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'bg-background shadow-lg',
              socialButtonsIconButton: 'border border-gray-300 hover:bg-gray-100',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-100',
              footerActionLink: 'text-primary font-medium hover:text-primary/80',
              identityPreview: 'bg-gray-50 border border-gray-200',
            }
          }}
        >
          <BrowserRouter>
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </ClerkProvider>
      )}
    </QueryClientProvider>
  );
};

export default App;
