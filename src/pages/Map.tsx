
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, RefreshCw } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import AirQualityMap from '@/components/AirQualityMap';
import AQIScale from '@/components/AQIScale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useRealTimeAirQuality } from '@/hooks/use-real-time-air-quality';

const Map = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { refreshData, lastRefresh } = useRealTimeAirQuality();
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not access your location. Using default location.");
          // Default to Thessaloniki
          setUserLocation({ lat: 40.63, lng: 22.95 });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setUserLocation({ lat: 40.63, lng: 22.95 });
    }
  }, []);
  
  // Simulate data loading
  useEffect(() => {
    if (userLocation) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userLocation]);
  
  const handleRefresh = () => {
    setIsLoading(true);
    refreshData();
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold"
          >
            Air Quality Map
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">About the Map</h4>
                  <p className="text-sm text-muted-foreground">
                    This map shows real-time air quality at monitoring stations. 
                    Colors indicate air quality levels from good (green) to hazardous (red).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
        
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AirQualityMap className="w-full" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto max-w-3xl"
        >
          <AQIScale className="w-full" />
          
          <div className="mt-6 rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> This map displays estimated air quality based on the nearest monitoring stations.
            </p>
            <p>
              Actual conditions may vary based on local factors such as traffic, construction, and weather patterns.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default Map;
