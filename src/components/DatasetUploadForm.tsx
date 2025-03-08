
import { useState, useRef } from 'react';
import { Upload, FileUp, X, RefreshCcw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDatasets } from '@/hooks/use-datasets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function DatasetUploadForm() {
  const { uploadDataset, isUploading, uploadProgress } = useDatasets();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  
  // Check authentication state
  useState(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };
    
    checkAuth();
  });
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!isSignedIn) {
      toast.error('Please sign in to upload datasets');
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast.error('Please sign in to upload datasets');
      return;
    }
    
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };
  
  const handleFileUpload = async (file: File) => {
    try {
      console.log(`File selected for upload: ${file.name} (${file.size} bytes, type: ${file.type})`);
      await uploadDataset(file);
    } catch (error) {
      console.error('Error in handleFileUpload:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      // Reset the input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };
  
  const onButtonClick = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to upload datasets');
      return;
    }
    
    inputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
        } transition-colors duration-200 ease-in-out flex flex-col items-center justify-center text-center`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,.json,.xlsx"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Upload your air quality dataset</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your CSV, JSON, or XLSX file, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: 10MB
            </p>
          </div>
          <Button
            type="button"
            disabled={isUploading}
            onClick={onButtonClick}
            className="mt-2"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Select File
          </Button>
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-3/4 max-w-md space-y-4">
              <h3 className="text-center font-medium">Uploading and Processing...</h3>
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {uploadProgress < 30 
                  ? 'Uploading file...' 
                  : uploadProgress < 70 
                    ? 'Processing data...' 
                    : 'Completing upload...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
