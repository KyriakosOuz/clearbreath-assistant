
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Wind, AlertTriangle, Info } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import CleanRouteMap from '@/components/CleanRouteMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

const CleanRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const { toast } = useToast();
  
  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlanRoute = () => {
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter both starting point and destination",
        variant: "destructive",
      });
      return;
    }

    setIsPlanning(true);
    
    // Simulate AI route planning
    setTimeout(() => {
      setIsPlanning(false);
      
      // Show success notification
      toast({
        title: "Clean Route Found",
        description: "AI has identified the cleanest route with 68% less pollution exposure",
        variant: "health",
      });
    }, 2000);
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
            Clean Route Planner
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">About Clean Routes</h4>
                  <p className="text-sm text-muted-foreground">
                    This AI-powered feature helps you find travel routes with the lowest pollution exposure,
                    keeping your lungs safer on your daily commute.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="start" className="text-sm font-medium">Starting Point</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="start"
                      placeholder="Enter starting location"
                      className="pl-10"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium">Destination</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="destination"
                      placeholder="Enter destination" 
                      className="pl-10"
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handlePlanRoute}
                  disabled={isPlanning}
                >
                  {isPlanning ? 'Finding Cleanest Route...' : 'Plan Clean Route'}
                </Button>
                
                <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Wind className="h-3.5 w-3.5" />
                  <span>
                    AI optimizes routes to minimize pollution exposure based on real-time air quality data.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Pollution Hotspots Today</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-red-500" />
                      <span>City Center (AQI: 128) - Construction dust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500" />
                      <span>Industrial Zone (AQI: 95) - Factory emissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-orange-500" />
                      <span>Main Highway (AQI: 87) - Traffic congestion</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Clean route planning will automatically avoid these areas where possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CleanRouteMap className="w-full" />
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default CleanRoute;
