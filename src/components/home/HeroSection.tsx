
import { motion } from 'framer-motion';
import { Upload, ArrowRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';

interface HeroSectionProps {
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
}

export function HeroSection({ uploadDialogOpen, setUploadDialogOpen }: HeroSectionProps) {
  return (
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
  );
}
