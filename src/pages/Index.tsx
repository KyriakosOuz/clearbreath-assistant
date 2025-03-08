
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileUp, Upload, Database, BarChart, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';
import { useDatasets } from '@/hooks/use-datasets';
import { DatasetCard } from '@/components/DatasetCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { datasets, isLoading, refetchDatasets } = useDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  
  // Get the most recent datasets (limit to 3)
  const recentDatasets = datasets.slice(0, 3);
  
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
        <section className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Database className="mr-1 h-3 w-3" />
              Air Quality Dataset Hub
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Analyze Air Quality Data with AetherIQ
            </h1>
            <p className="mb-8 text-muted-foreground">
              Upload, analyze, and visualize air quality datasets. Get insights and plan safer routes based on pollution patterns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-medium">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Dataset
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Dataset</DialogTitle>
                    <DialogDescription>
                      Upload your air quality dataset to analyze and visualize pollution patterns.
                    </DialogDescription>
                  </DialogHeader>
                  <DatasetUploadForm />
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/dashboard">
                  Explore Datasets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
        
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 text-center text-2xl font-bold"
            >
              {isSignedIn 
                ? `Your Recent Datasets, ${userName}`
                : 'Recent Datasets'}
            </motion.h2>
            
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[200px] rounded-2xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : recentDatasets.length === 0 ? (
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No datasets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first dataset to get started with analysis.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload First Dataset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upload New Dataset</DialogTitle>
                        <DialogDescription>
                          Upload your air quality dataset to analyze and visualize pollution patterns.
                        </DialogDescription>
                      </DialogHeader>
                      <DatasetUploadForm />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  {recentDatasets.map((dataset) => (
                    <DatasetCard 
                      key={dataset.id} 
                      dataset={dataset} 
                      onView={() => handleViewDataset(dataset.id)}
                    />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button asChild variant="outline">
                    <Link to="/datasets">
                      View All Datasets
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
        
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6 text-center text-2xl font-bold"
            >
              Data-Driven Air Quality Analysis
            </motion.h2>
            
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: 'Upload & Analyze',
                  description: 'Upload your datasets in CSV or JSON format and get instant insights.',
                  icon: Upload,
                  delay: 0.7
                },
                {
                  title: 'Visualization',
                  description: 'Explore data through interactive visualizations and statistics.',
                  icon: BarChart,
                  delay: 0.8
                },
                {
                  title: 'Clean Route Planning',
                  description: 'Find the cleaner, shorter routes based on air quality data.',
                  icon: RefreshCw,
                  delay: 0.9
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="glass-card rounded-xl p-6"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  );
};

export default Index;
