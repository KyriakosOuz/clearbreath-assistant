
import React, { useState, useEffect } from 'react';
import { useAuthProtect } from '@/hooks/use-auth-protect';
import { motion } from 'framer-motion';
import { useDatasets } from '@/hooks/use-datasets';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

const Dashboard = () => {
  // Protect this route - only authenticated users can access
  const { isLoaded, isSignedIn } = useAuthProtect();
  const { datasets, isLoading, refetchDatasets } = useDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  
  useEffect(() => {
    // Get user information from Supabase
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Use the part before @ in the email as the name
        const emailName = user.email.split('@')[0];
        setUserName(emailName);
      }
    };
    
    getUserInfo();
  }, []);
  
  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleViewDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DashboardHeader
          userName={userName}
          uploadDialogOpen={uploadDialogOpen}
          setUploadDialogOpen={setUploadDialogOpen}
          refetchDatasets={refetchDatasets}
        />

        <DashboardStats datasets={datasets} />

        <DashboardTabs
          datasets={datasets}
          isLoading={isLoading}
          selectedDatasetId={selectedDatasetId}
          onViewDataset={handleViewDataset}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;
