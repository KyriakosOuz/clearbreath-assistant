
import React from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';

interface DashboardHeaderProps {
  userName: string;
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  refetchDatasets: () => void;
}

export function DashboardHeader({ 
  userName, 
  uploadDialogOpen, 
  setUploadDialogOpen, 
  refetchDatasets 
}: DashboardHeaderProps) {
  return (
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
  );
}
