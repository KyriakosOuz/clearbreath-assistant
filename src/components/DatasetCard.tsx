
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AirQualityDataset } from '@/types/dataset';
import { useDatasets } from '@/hooks/use-datasets';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Trash2, Eye, BarChart, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface DatasetCardProps {
  dataset: AirQualityDataset;
  onView?: (datasetId: string) => void;
}

export function DatasetCard({ dataset, onView }: DatasetCardProps) {
  const { deleteDataset, isDeleting, reprocessDataset } = useDatasets();
  const [isReprocessing, setIsReprocessing] = useState(false);
  
  const handleReprocess = async () => {
    setIsReprocessing(true);
    await reprocessDataset(dataset.id);
    setIsReprocessing(false);
  };
  
  const statusColors = {
    Pending: 'bg-yellow-500',
    Processing: 'bg-blue-500',
    Completed: 'bg-green-500',
    Failed: 'bg-red-500'
  };
  
  const statusBadgeColor = {
    Pending: 'yellow',
    Processing: 'blue',
    Completed: 'green',
    Failed: 'destructive'
  } as const;
  
  const fileTypeIcon = {
    csv: '📊',
    json: '📋',
  };
  
  const timeAgo = formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{fileTypeIcon[dataset.file_type as keyof typeof fileTypeIcon] || '📄'}</span>
            <div>
              <CardTitle className="text-base line-clamp-1" title={dataset.original_file_name}>
                {dataset.original_file_name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
            </div>
          </div>
          <Badge variant={statusBadgeColor[dataset.status as keyof typeof statusBadgeColor] || 'secondary'}>
            {dataset.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">File size:</span>
            <span>{(dataset.file_size / 1024).toFixed(2)} KB</span>
          </div>
          {dataset.row_count && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rows:</span>
              <span>{dataset.row_count.toLocaleString()}</span>
            </div>
          )}
          {dataset.column_names && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Columns:</span>
              <span>{(dataset.column_names as string[]).length}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 flex justify-between">
        {dataset.status === 'Completed' && onView && (
          <Button variant="outline" size="sm" onClick={() => onView(dataset.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
        
        {dataset.status === 'Failed' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReprocess}
            disabled={isReprocessing}
          >
            {isReprocessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reprocessing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        )}
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete dataset</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the dataset and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDataset(dataset.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export function DatasetCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-md mr-2" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
}
