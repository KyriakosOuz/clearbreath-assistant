
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Locate, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AirQualityMapProps {
  className?: string;
}

interface MapLocation {
  id: string;
  name: string;
  aqi: number;
  lat: number;
  lng: number;
}

// Mock data for air quality locations
const mockLocations: MapLocation[] = [
  { id: '1', name: 'City Center', aqi: 45, lat: 40.63, lng: 22.95 },
  { id: '2', name: 'Eastern District', aqi: 72, lat: 40.64, lng: 22.97 },
  { id: '3', name: 'Harbor Area', aqi: 105, lat: 40.62, lng: 22.93 },
  { id: '4', name: 'Western Suburbs', aqi: 38, lat: 40.61, lng: 22.92 },
  { id: '5', name: 'Northern Hills', aqi: 22, lat: 40.65, lng: 22.94 },
  { id: '6', name: 'Industrial Zone', aqi: 128, lat: 40.63, lng: 22.91 },
];

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-aqi-good';
  if (aqi <= 100) return 'bg-aqi-moderate';
  if (aqi <= 150) return 'bg-aqi-unhealthy';
  if (aqi <= 300) return 'bg-aqi-hazardous';
  return 'bg-aqi-severe';
};

const AirQualityMap = ({ className }: AirQualityMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };
  
  return (
    <div className={cn('relative rounded-2xl bg-white shadow-lg overflow-hidden', className)}>
      <div className="relative h-[500px] w-full">
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        
        {/* This would be replaced with an actual map integration */}
        <div 
          ref={mapRef}
          className={cn(
            'absolute inset-0 bg-blue-50 transition-opacity duration-1000',
            isMapLoaded ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Map visualization placeholder */}
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.63,22.95&zoom=12&size=800x500&scale=2&style=feature:all%7Celement:all%7Cvisibility:on%7Ccolor:0xf2f2f2&style=feature:landscape%7Celement:geometry%7Ccolor:0xf2f2f2&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:all%7Csaturation:-100%7Clightness:45&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:transit%7Celement:all%7Cvisibility:off&style=feature:water%7Celement:all%7Ccolor:0xcdcdcd&key=DEMO_KEY')] bg-cover bg-center bg-no-repeat opacity-50" />

          {/* Location pins */}
          {isMapLoaded && mockLocations.map((location) => (
            <motion.div
              key={location.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
              onClick={() => handleLocationSelect(location)}
              style={{
                left: `${((location.lng - 22.9) * 100) + 50}%`,
                top: `${((40.66 - location.lat) * 100) + 50}%`
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            >
              <div className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110',
                getAQIColor(location.aqi)
              )}>
                <MapPin className="h-4 w-4 text-white" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
                  {location.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Location info overlay */}
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{selectedLocation.name}</h3>
                <p className="text-sm text-muted-foreground">AQI: {selectedLocation.aqi}</p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Map controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-muted">
            <Locate className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;
