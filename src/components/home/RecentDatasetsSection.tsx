
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileUp, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';
import { DatasetCard } from '@/components/DatasetCard';
import { AirQualityDataset } from '@/types/dataset';

interface RecentDatasetsSectionProps {
  datasets: AirQualityDataset[];
  isLoading: boolean;
  userName: string;
  isSignedIn: boolean | null;
  onViewDataset: (datasetId: string) => void;
}

export function RecentDatasetsSection({ 
  datasets, 
  isLoading, 
  userName, 
  isSignedIn,
  onViewDataset 
}: RecentDatasetsSectionProps) {
  // Get the most recent datasets (limit to 3)
  const recentDatasets = datasets.slice(0, 3);
  
  return (
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
                  onView={() => onViewDataset(dataset.id)}
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
  );
}
