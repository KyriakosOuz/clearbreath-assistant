
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Wind, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import CleanRouteForm from '@/components/CleanRouteForm';
import CleanRouteMap from '@/components/CleanRouteMap';
import AQIScale from '@/components/AQIScale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PollutionPoint {
  lat: number;
  lon: number;
  aqi: number;
  station: {
    name: string;
  };
}

const CleanRoute = () => {
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [pollutionData, setPollutionData] = useState<PollutionPoint[]>([]);

  const handleRouteSelected = async (origin: string, destination: string, transportMode: string) => {
    setOrigin(origin);
    setDestination(destination);
    setTransportMode(transportMode);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('clean-route-ai', {
        body: { origin, destination, transportMode },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Clean route AI response:', data);
      setRecommendation(data.recommendation);
      setPollutionData(data.pollutionData || []);
      toast.success('Route analysis complete!');
    } catch (error) {
      console.error('Error finding clean route:', error);
      toast.error('Failed to analyze route. Please try again.');
      setRecommendation('Unable to generate a recommendation at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if we have high pollution areas
  const hasHighPollution = pollutionData.some(point => point.aqi > 100);

  return (
    <div className="flex flex-col w-full min-h-screen p-6 lg:pl-[70px] xl:pl-60">
      <motion.div
        className="flex flex-col gap-6 pb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="flex items-center gap-2">
              <CloudSun className="h-8 w-8 text-sky-500" /> 
              Clean Route Planner
            </span>
          </h1>
          <p className="text-muted-foreground">
            Find the cleanest routes with the lowest air pollution to protect your health
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - Form */}
          <div className="lg:col-span-4 space-y-6">
            <CleanRouteForm 
              onRouteSelected={handleRouteSelected}
              isLoading={loading}
            />
            
            <AQIScale compact />
            
            {hasHighPollution && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>High Pollution Alert</AlertTitle>
                <AlertDescription>
                  There are areas with unhealthy air quality (AQI &gt; 100) along this route. 
                  Consider following the recommended cleaner alternatives.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right side - Map and Recommendations */}
          <div className="lg:col-span-8 space-y-6">
            {/* Map */}
            <Card className="border shadow-sm">
              <CardContent className="p-0 min-h-[400px] overflow-hidden rounded-md">
                {origin && destination ? (
                  <CleanRouteMap 
                    origin={origin} 
                    destination={destination}
                    transportMode={transportMode || 'walking'}
                    pollutionData={pollutionData}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] bg-muted/20">
                    <p className="text-muted-foreground">Select origin and destination to view the map</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="mr-2 h-5 w-5 text-green-500" />
                  AI Route Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized clean route suggestions powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                ) : recommendation ? (
                  <ScrollArea className="h-[300px] rounded-md">
                    <div className="space-y-4 pr-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {origin && destination && (
                          <Badge variant="outline" className="bg-blue-50">
                            {transportMode?.charAt(0).toUpperCase() + transportMode?.slice(1) || 'Walking'}
                          </Badge>
                        )}
                        {hasHighPollution && (
                          <Badge variant="destructive">
                            High Pollution Detected
                          </Badge>
                        )}
                      </div>
                      <div className="whitespace-pre-line">
                        {recommendation}
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground p-6">
                    <Wind className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Select a route to get AI-powered clean route recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CleanRoute;
