
import { useDatasets } from '@/hooks/use-datasets';
import { DatasetCard, DatasetCardSkeleton } from './DatasetCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { AirQualityDataset } from '@/types/dataset';

export function DatasetList() {
  const { datasets, isLoading, refetchDatasets } = useDatasets();
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter datasets based on the active tab
  const filteredDatasets = datasets.filter(dataset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return dataset.status === 'Completed';
    if (activeTab === 'processing') return dataset.status === 'Processing' || dataset.status === 'Pending';
    if (activeTab === 'failed') return dataset.status === 'Failed';
    return true;
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Your Datasets</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <DatasetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  if (datasets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Your Datasets</h2>
          <Button variant="outline" size="sm" onClick={() => refetchDatasets()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium">No datasets yet</h3>
          <p className="text-muted-foreground mt-1">
            Upload your first air quality dataset to get started.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Datasets ({datasets.length})</h2>
        <Button variant="outline" size="sm" onClick={() => refetchDatasets()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredDatasets.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium">No datasets in this category</h3>
              <p className="text-muted-foreground mt-1">
                Try a different filter or upload a new dataset.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDatasets.map(dataset => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
