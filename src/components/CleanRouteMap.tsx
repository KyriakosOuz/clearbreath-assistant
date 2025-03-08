import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getGoogleMapsApiKey } from '@/lib/google-maps';

interface CleanRouteMapProps {
  className?: string;
  origin: string;
  destination: string;
  transportMode: string;
  pollutionData: Array<{
    lat: number;
    lon: number;
    aqi: number;
    station: {
      name: string;
    };
  }>;
}

interface Route {
  id: string;
  name: string;
  durationMinutes: number;
  distanceKm: number;
  pollutionExposure: number;
  points: { lat: number, lng: number }[];
  isCleanest: boolean;
}

const mockRoutes: Route[] = [
  { 
    id: '1', 
    name: 'Clean Route (Recommended)', 
    durationMinutes: 28, 
    distanceKm: 5.7, 
    pollutionExposure: 32,
    points: [
      { lat: 40.63, lng: 22.95 },
      { lat: 40.634, lng: 22.953 },
      { lat: 40.637, lng: 22.955 },
      { lat: 40.64, lng: 22.96 }
    ],
    isCleanest: true
  },
  { 
    id: '2', 
    name: 'Fastest Route', 
    durationMinutes: 22, 
    distanceKm: 4.8, 
    pollutionExposure: 78,
    points: [
      { lat: 40.63, lng: 22.95 },
      { lat: 40.632, lng: 22.96 },
      { lat: 40.635, lng: 22.965 },
      { lat: 40.64, lng: 22.96 }
    ],
    isCleanest: false
  },
  { 
    id: '3', 
    name: 'Shortest Route', 
    durationMinutes: 24, 
    distanceKm: 4.5, 
    pollutionExposure: 85,
    points: [
      { lat: 40.63, lng: 22.95 },
      { lat: 40.635, lng: 22.952 },
      { lat: 40.639, lng: 22.956 },
      { lat: 40.64, lng: 22.96 }
    ],
    isCleanest: false
  }
];

const getPollutionColor = (level: number): string => {
  if (level < 40) return 'bg-green-500';
  if (level < 60) return 'bg-yellow-500';
  if (level < 80) return 'bg-orange-500';
  return 'bg-red-500';
};

const CleanRouteMap = ({ className, origin, destination, transportMode, pollutionData }: CleanRouteMapProps) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapApiKey, setMapApiKey] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        setMapApiKey(key);
      } catch (error) {
        console.error("Failed to load Google Maps API key:", error);
      }
    };
    
    fetchApiKey();
  }, []);
  
  useEffect(() => {
    if (mapApiKey) {
      const timer = setTimeout(() => {
        setIsMapLoaded(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [mapApiKey]);

  useEffect(() => {
    if (isMapLoaded) {
      const timer = setTimeout(() => {
        setShowRoutes(true);
        setSelectedRoute(mockRoutes[0]);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMapLoaded]);
  
  useEffect(() => {
    if (selectedRoute) {
      const timer = setTimeout(() => {
        if (Math.random() > 0.5) {
          toast({
            title: "Real-time Alert",
            description: "Pollution levels increased ahead. Route recalculated.",
            variant: "destructive",
          });
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedRoute, toast]);
  
  return (
    <div className={cn('relative rounded-2xl bg-white shadow-lg overflow-hidden', className)}>
      <div className="relative h-[500px] w-full">
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        
        <div 
          className={cn(
            'absolute inset-0 bg-blue-50 transition-opacity duration-1000',
            isMapLoaded ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70" 
            style={{
              backgroundImage: mapApiKey ? 
                `url('https://maps.googleapis.com/maps/api/staticmap?center=40.63,22.95&zoom=13&size=800x500&scale=2&style=feature:all%7Celement:all%7Cvisibility:on%7Ccolor:0xf2f2f2&style=feature:landscape%7Celement:geometry%7Ccolor:0xf2f2f2&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:all%7Csaturation:-100%7Clightness:45&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:transit%7Celement:all%7Cvisibility:off&style=feature:water%7Celement:all%7Ccolor:0xcdcdcd&key=${mapApiKey}')` :
                'none'
            }}
          >
            {showRoutes && mockRoutes.map((route) => {
              const isSelected = selectedRoute?.id === route.id;
              
              return (
                <div 
                  key={route.id}
                  className={cn(
                    'absolute inset-0 pointer-events-none transition-opacity duration-500',
                    isSelected ? 'opacity-100' : 'opacity-30'
                  )}
                >
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d={`M ${(route.points[0].lng - 22.9) * 500 + 150} ${(40.66 - route.points[0].lat) * 500 + 100} 
                          C ${(route.points[1].lng - 22.9) * 500 + 150} ${(40.66 - route.points[1].lat) * 500 + 100},
                            ${(route.points[2].lng - 22.9) * 500 + 150} ${(40.66 - route.points[2].lat) * 500 + 100},
                            ${(route.points[3].lng - 22.9) * 500 + 150} ${(40.66 - route.points[3].lat) * 500 + 100}`}
                      stroke={route.isCleanest ? "#22c55e" : "#f97316"}
                      strokeWidth={isSelected ? 5 : 3}
                      strokeLinecap="round"
                      strokeDasharray={route.isCleanest ? "0" : "10,5"}
                      fill="none"
                    />
                  </svg>
                  
                  {route.id === '2' && isSelected && (
                    <div className="absolute top-[40%] left-[50%] h-16 w-16 rounded-full bg-red-500/20 animate-pulse" />
                  )}
                  {route.id === '3' && isSelected && (
                    <div className="absolute top-[45%] left-[48%] h-20 w-20 rounded-full bg-red-500/20 animate-pulse" />
                  )}
                  
                  <div className="absolute bottom-[30%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 border-2 border-white shadow-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="absolute top-[20%] right-[40%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 border-2 border-white shadow-md">
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  {isSelected && (
                    <>
                      <div className="absolute bottom-[40%] right-[40%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/30 border border-red-500">
                          <AlertTriangle className="h-3 w-3 text-red-600" />
                        </div>
                      </div>
                      
                      <div className="absolute top-[40%] left-[35%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/30 border border-orange-500">
                          <AlertTriangle className="h-3 w-3 text-orange-600" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {showRoutes && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 w-64 rounded-lg bg-white/95 p-4 shadow-lg"
          >
            <h3 className="font-medium mb-3">Available Routes</h3>
            
            <div className="space-y-3">
              {mockRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={cn(
                    'cursor-pointer rounded-md p-3 transition-colors',
                    selectedRoute?.id === route.id 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-muted/40 hover:bg-muted/60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{route.name}</div>
                    {route.isCleanest && (
                      <div className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                        AI Pick
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{route.durationMinutes}m</span>
                      <span>Duration</span>
                    </div>
                    <div className="flex flex-col">
                      <span>{route.distanceKm} km</span>
                      <span>Distance</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        'font-medium',
                        route.pollutionExposure < 40 ? 'text-green-600' : 
                        route.pollutionExposure < 60 ? 'text-yellow-600' :
                        route.pollutionExposure < 80 ? 'text-orange-600' : 'text-red-600'
                      )}>
                        {route.pollutionExposure}%
                      </span>
                      <span>Exposure</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          getPollutionColor(route.pollutionExposure)
                        )}
                        style={{ width: `${route.pollutionExposure}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Navigation Started",
                    description: "We'll monitor air quality and update your route if needed",
                    variant: "health",
                  });
                }}
              >
                <Navigation className="mr-2 h-4 w-4" />
                Start Navigation
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 mt-1">
                <ArrowRight className="h-3 w-3" /> 
                <span>Clean route saves 68% pollution exposure</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowRight className="h-3 w-3" /> 
                <span>Real-time updates as conditions change</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {isMapLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-4 bg-white border-t text-sm grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <h4 className="font-medium">Route Types</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-green-500 rounded-full" />
                <span>Clean Route (Low Pollution)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-orange-500 rounded-full stroke-dasharray-2" />
                <span>Standard Route (Higher Exposure)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Pollution Markers</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/30 border border-red-500">
                  <AlertTriangle className="h-2 w-2 text-red-600" />
                </div>
                <span>High Pollution Area</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500/50 animate-pulse" />
                <span>Active Pollution Warning</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CleanRouteMap;
