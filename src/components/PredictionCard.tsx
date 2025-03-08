
import { useState } from 'react';
import { Trash2, MapPin, Route, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PollutionPrediction } from '@/types/dataset';
import { usePredictions } from '@/hooks/use-predictions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Status badge component
const StatusBadge = ({ status }: { status: PollutionPrediction['status'] }) => {
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

interface PredictionCardProps {
  prediction: PollutionPrediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const { deletePrediction } = usePredictions(prediction.dataset_id);
  const navigate = useNavigate();
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this prediction?`)) {
      deletePrediction(prediction.id);
    }
  };
  
  const handleViewRoute = () => {
    // Navigate to the map page with the prediction ID
    navigate(`/clean-route?predictionId=${prediction.id}`);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-md bg-muted p-2">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">
                Prediction {prediction.id.substring(0, 8)}...
              </CardTitle>
              <CardDescription className="mt-1">
                {format(new Date(prediction.created_at), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
          </div>
          <StatusBadge status={prediction.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Pollution zones: </span>
            <span className="ml-1 font-medium">
              {prediction.predicted_pollution_zones?.length || 0}
            </span>
          </div>
          
          {prediction.generated_routes && (
            <div className="flex items-center text-sm">
              <Route className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Routes: </span>
              <span className="ml-1 font-medium">
                {prediction.generated_routes.clean ? 'Standard & Clean' : 'Not available'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewRoute}
          disabled={prediction.status !== 'Completed' || !prediction.generated_routes}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          View Routes
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
      </CardFooter>
    </Card>
  );
}

// Skeleton loader for the prediction card
export function PredictionCardSkeleton() {
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
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </CardFooter>
    </Card>
  );
}
