
import { useState } from 'react';
import { Search, MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CleanRouteFormProps {
  onRouteSelected: (origin: string, destination: string, transportMode: string) => void;
  isLoading: boolean;
}

const CleanRouteForm = ({ onRouteSelected, isLoading }: CleanRouteFormProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('walking');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination) {
      toast.error('Please enter both origin and destination');
      return;
    }

    onRouteSelected(origin, destination, transportMode);
  };

  const handleDemoRoute = () => {
    // Use predefined coordinates for a demo route (San Francisco)
    setOrigin('37.7749,-122.4194');
    setDestination('37.7833,-122.4324');
    setShowDemo(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="mr-2 h-5 w-5" /> 
          Clean Route Planner
        </CardTitle>
        <CardDescription>
          Find routes with the cleanest air to protect your health
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <label htmlFor="origin" className="text-sm font-medium">Starting Point</label>
            </div>
            <Input
              id="origin"
              placeholder="Enter coordinates (lat,lng)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <label htmlFor="destination" className="text-sm font-medium">Destination</label>
            </div>
            <Input
              id="destination"
              placeholder="Enter coordinates (lat,lng)" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="transportMode" className="text-sm font-medium">Mode of Transport</label>
            <Select
              value={transportMode}
              onValueChange={(value) => setTransportMode(value)}
            >
              <SelectTrigger id="transportMode">
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="bicycling">Bicycling</SelectItem>
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="transit">Public Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-4 rounded-full mr-2" />
                  Finding Cleanest Route...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Clean Route
                </>
              )}
            </Button>

            {!showDemo && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoRoute}
              >
                Use Demo Route
              </Button>
            )}
          </div>
        </form>

        <Alert className="mt-4 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Coordinate Format</AlertTitle>
          <AlertDescription>
            Please enter coordinates in the format: latitude,longitude (e.g., 37.7749,-122.4194)
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CleanRouteForm;
