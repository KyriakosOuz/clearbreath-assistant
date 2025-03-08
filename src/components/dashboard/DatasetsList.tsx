
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AirQualityDataset } from '@/types/dataset';
import { DatasetCard } from '@/components/DatasetCard';
import { Database, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';

interface DatasetsListProps {
  datasets: AirQualityDataset[];
  isLoading: boolean;
  onViewDataset: (datasetId: string) => void;
}

export function DatasetsList({ datasets, isLoading, onViewDataset }: DatasetsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-[200px] rounded-2xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => (
        <DatasetCard 
          key={dataset.id} 
          dataset={dataset} 
          onView={onViewDataset}
        />
      ))}
    </div>
  );
}
