
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { DatasetViewer } from '@/components/dataset-viewer/DatasetViewer';
import { DatasetsList } from './DatasetsList';
import { AirQualityDataset } from '@/types/dataset';

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
  return (
    <Tabs defaultValue={selectedDatasetId ? "viewer" : "datasets"} className="mt-6">
      <TabsList>
        <TabsTrigger value="datasets">My Datasets</TabsTrigger>
        {selectedDatasetId && <TabsTrigger value="viewer">Dataset Viewer</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="datasets" className="mt-4">
        <DatasetsList 
          datasets={datasets}
          isLoading={isLoading}
          onViewDataset={onViewDataset}
        />
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
  );
}
