
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { DatasetViewer } from '@/components/dataset-viewer/DatasetViewer';
import { DatasetsList } from './DatasetsList';
import { AirQualityDataset } from '@/types/dataset';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDatasets } from '@/hooks/use-datasets';

interface DashboardTabsProps {
  datasets: AirQualityDataset[];
  isLoading: boolean;
  selectedDatasetId: string | null;
  onViewDataset: (datasetId: string) => void;
}

export function DashboardTabs({ 
  datasets, 
  isLoading, 
  selectedDatasetId, 
  onViewDataset 
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedDatasetId ? "viewer" : "datasets");
  const { reprocessDataset } = useDatasets();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const selectedDataset = selectedDatasetId ? 
    datasets.find(d => d.id === selectedDatasetId) : null;

  const handleProcessDataset = async () => {
    if (!selectedDatasetId) return;
    
    setProcessingId(selectedDatasetId);
    try {
      await reprocessDataset(selectedDatasetId);
      toast.success("Dataset processing started", {
        description: "You'll be notified when processing is complete"
      });
    } catch (error) {
      toast.error("Failed to process dataset", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList>
        <TabsTrigger value="datasets">My Datasets</TabsTrigger>
        {selectedDatasetId && <TabsTrigger value="viewer">Dataset Viewer</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="datasets" className="mt-4">
        <DatasetsList 
          datasets={datasets}
          isLoading={isLoading}
          onViewDataset={(id) => {
            onViewDataset(id);
            setActiveTab('viewer');
          }}
        />
      </TabsContent>
      
      <TabsContent value="viewer" className="mt-4">
        {selectedDatasetId ? (
          <div className="space-y-4">
            {selectedDataset && selectedDataset.status === 'Pending' && (
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium">Dataset Pending Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      This dataset is waiting to be processed. Process it now to view statistics and analysis.
                    </p>
                  </div>
                  <Button 
                    variant="secondary"
                    className="bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800"
                    onClick={handleProcessDataset}
                    disabled={processingId === selectedDatasetId}
                  >
                    {processingId === selectedDatasetId ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Process Dataset
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <DatasetViewer datasetId={selectedDatasetId} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Select a dataset to view its contents.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
