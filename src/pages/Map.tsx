
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import AirQualityMap from '@/components/AirQualityMap';
import AQIScale from '@/components/AQIScale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Map = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
            <Button variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              Find Nearest Station
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
                    This map shows real-time air quality at monitoring stations across Thessaloniki.
                    Colors indicate air quality levels from good (green) to hazardous (red).
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
