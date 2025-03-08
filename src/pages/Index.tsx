
import { useState, useEffect } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useDatasets } from '@/hooks/use-datasets';
import { supabase } from '@/integrations/supabase/client';

import { HeroSection } from '@/components/home/HeroSection';
import { RecentDatasetsSection } from '@/components/home/RecentDatasetsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';

const Index = () => {
  const { datasets, isLoading, refetchDatasets } = useDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Get user information from Supabase
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Use the part before @ in the email as the name
        const emailName = user.email.split('@')[0];
        setUserName(emailName);
        setIsSignedIn(true);
      } else {
        setIsSignedIn(false);
      }
    };
    
    getUserInfo();
  }, []);
  
  const handleViewDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };
  
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <HeroSection 
          uploadDialogOpen={uploadDialogOpen}
          setUploadDialogOpen={setUploadDialogOpen}
        />
        
        <RecentDatasetsSection 
          datasets={datasets}
          isLoading={isLoading}
          userName={userName}
          isSignedIn={isSignedIn}
          onViewDataset={handleViewDataset}
        />
        
        <FeaturesSection />
      </div>
    </AnimatedBackground>
  );
};

export default Index;
