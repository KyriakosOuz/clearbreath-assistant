
import { useState } from 'react';
import { FileSpreadsheet, Trash2, RefreshCw, Eye, Calendar, Layers, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AirQualityDataset } from '@/types/dataset';
import { useDatasets } from '@/hooks/use-datasets';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Status badge component
const StatusBadge = ({ status }: { status: AirQualityDataset['status'] }) => {
  switch (status) {
    case 'Pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
    case 'Processing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
    case 'Completed':
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
    case 'Failed':
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface DatasetCardProps {
  dataset: AirQualityDataset;
  onView?: (dataset: AirQualityDataset) => void;
}

export function DatasetCard({ dataset, onView }: DatasetCardProps) {
  const { deleteDataset, reprocessDataset } = useDatasets();
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      await reprocessDataset(dataset.id);
    } finally {
      setIsReprocessing(false);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the dataset "${dataset.original_file_name}"?`)) {
      deleteDataset(dataset.id);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-muted p-2">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base truncate max-w-[200px]" title={dataset.original_file_name}>
                {dataset.original_file_name}
              </CardTitle>
              <CardDescription className="mt-1">
                {formatFileSize(dataset.file_size)}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={dataset.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Uploaded: </span>
            <span className="ml-1 font-medium">
              {format(new Date(dataset.upload_date), 'MMM dd, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Layers className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Rows: </span>
            <span className="ml-1 font-medium">
              {dataset.row_count || 'Unknown'}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Columns: </span>
            <span className="ml-1 font-medium">
              {dataset.column_names ? dataset.column_names.length : 'Unknown'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={dataset.status !== 'Completed'}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Dataset Preview: {dataset.original_file_name}</DialogTitle>
              <DialogDescription>
                Showing up to 5 rows from your dataset.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96">
              {dataset.data_preview && (
                <div className="border rounded-md">
                  <div className="grid grid-cols-auto-fit-250 gap-x-4 bg-muted p-3 border-b">
                    {dataset.column_names?.map((col, idx) => (
                      <div key={idx} className="font-medium text-sm truncate">
                        {col}
                      </div>
                    ))}
                  </div>
                  <div className="p-2">
                    {Array.isArray(dataset.data_preview) ? (
                      dataset.data_preview.map((row, rowIdx) => (
                        <div 
                          key={rowIdx} 
                          className="grid grid-cols-auto-fit-250 gap-x-4 p-2 border-b border-muted last:border-0"
                        >
                          {dataset.column_names?.map((col, colIdx) => (
                            <div key={colIdx} className="text-sm truncate">
                              {String(row[col] ?? 'N/A')}
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm">Data preview not available in expected format.</div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isReprocessing || dataset.status === 'Processing'}
            onClick={handleReprocess}
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
            Reprocess
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Skeleton loader for the dataset card
export function DatasetCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Skeleton className="h-8 w-24 rounded" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}
