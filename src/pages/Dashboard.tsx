
import React, { useState, useEffect } from 'react';
import { useAuthProtect } from '@/hooks/use-auth-protect';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, Database, Upload, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDatasets } from '@/hooks/use-datasets';
import { DatasetCard } from '@/components/DatasetCard';
import { DatasetViewer } from '@/components/dataset-viewer/DatasetViewer';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

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

  const getDatasetStats = () => {
    const totalDatasets = datasets.length;
    const completedDatasets = datasets.filter(d => d.status === 'Completed').length;
    const pendingDatasets = datasets.filter(d => d.status === 'Pending' || d.status === 'Processing').length;
    const failedDatasets = datasets.filter(d => d.status === 'Failed').length;
    
    const totalRows = datasets.reduce((acc, dataset) => {
      return acc + (dataset.row_count || 0);
    }, 0);
    
    return { totalDatasets, completedDatasets, pendingDatasets, failedDatasets, totalRows };
  };

  const stats = getDatasetStats();

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dataset Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome, {userName}! Manage and analyze your air quality datasets.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
            <Button 
              variant="outline"
              onClick={() => {
                refetchDatasets();
                toast.success("Datasets Refreshed", {
                  description: "Your dataset list has been updated",
                });
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDatasets}</div>
              <p className="text-xs text-muted-foreground">Uploaded datasets</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedDatasets}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>{stats.totalDatasets > 0 ? Math.round((stats.completedDatasets / stats.totalDatasets) * 100) : 0}% of total</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDatasets}</div>
              <div className="flex items-center text-xs text-blue-600">
                <span>Awaiting completion</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Across all datasets</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={selectedDatasetId ? "viewer" : "datasets"} className="mt-6">
          <TabsList>
            <TabsTrigger value="datasets">My Datasets</TabsTrigger>
            {selectedDatasetId && <TabsTrigger value="viewer">Dataset Viewer</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="datasets" className="mt-4">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-[200px] rounded-2xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {datasets.map((dataset) => (
                  <DatasetCard 
                    key={dataset.id} 
                    dataset={dataset} 
                    onView={handleViewDataset}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="viewer" className="mt-4">
            {selectedDatasetId ? (
              <DatasetViewer datasetId={selectedDatasetId} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Select a dataset to view its contents.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Dashboard;
