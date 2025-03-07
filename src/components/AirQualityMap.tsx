
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Locate, X, BarChart3, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

interface ForecastDataPoint {
  hour: string;
  aqi: number;
  timestamp: string;
  isPrediction: boolean;
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

// Mock historical data (past 7 days)
const mockHistoricalData: { date: string, averageAQI: number }[] = [
  { date: '2023-06-01', averageAQI: 48 },
  { date: '2023-06-02', averageAQI: 53 },
  { date: '2023-06-03', averageAQI: 65 },
  { date: '2023-06-04', averageAQI: 42 },
  { date: '2023-06-05', averageAQI: 38 },
  { date: '2023-06-06', averageAQI: 51 },
  { date: '2023-06-07', averageAQI: 57 },
];

// Mock forecast data for next 24 hours
const mockForecastData: ForecastDataPoint[] = [
  { hour: '09:00', aqi: 45, timestamp: '2023-06-08T09:00:00', isPrediction: false },
  { hour: '12:00', aqi: 52, timestamp: '2023-06-08T12:00:00', isPrediction: false },
  { hour: '15:00', aqi: 68, timestamp: '2023-06-08T15:00:00', isPrediction: false },
  { hour: '18:00', aqi: 75, timestamp: '2023-06-08T18:00:00', isPrediction: true },
  { hour: '21:00', aqi: 62, timestamp: '2023-06-08T21:00:00', isPrediction: true },
  { hour: '00:00', aqi: 45, timestamp: '2023-06-09T00:00:00', isPrediction: true },
  { hour: '03:00', aqi: 35, timestamp: '2023-06-09T03:00:00', isPrediction: true },
  { hour: '06:00', aqi: 32, timestamp: '2023-06-09T06:00:00', isPrediction: true },
];

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return 'bg-aqi-good';
  if (aqi <= 100) return 'bg-aqi-moderate';
  if (aqi <= 150) return 'bg-aqi-unhealthy';
  if (aqi <= 300) return 'bg-aqi-hazardous';
  return 'bg-aqi-severe';
};

const getAQITextColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-green-600';
  if (aqi <= 100) return 'text-yellow-600';
  if (aqi <= 150) return 'text-orange-600';
  if (aqi <= 300) return 'text-red-600';
  return 'text-purple-600';
};

const AirQualityMap = ({ className }: AirQualityMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>(mockForecastData);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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

  const fetchAIPrediction = async () => {
    setIsForecastLoading(true);
    setShowForecast(true);
    
    // Simulate API call to Mistral AI
    setTimeout(() => {
      // In a real implementation, this would be a call to Mistral AI API
      // Example payload would include:
      // - Historical air quality data (last 7 days)
      // - Current weather conditions
      // - Location details
      
      console.log('Fetching AI prediction for pollution forecast...');
      
      // After "receiving" prediction, update the state
      setForecastData(mockForecastData);
      setIsForecastLoading(false);
      
      // Show notification about high pollution periods
      const highPollutionPeriods = mockForecastData.filter(point => point.aqi > 70 && point.isPrediction);
      
      if (highPollutionPeriods.length > 0) {
        toast({
          title: "Pollution Alert",
          description: `High pollution levels predicted at ${highPollutionPeriods[0].hour}. Consider staying indoors.`,
          variant: "destructive",
        });
      }
    }, 2000);
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 flex items-center gap-1"
                  onClick={fetchAIPrediction}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Show AI Forecast</span>
                </Button>
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
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-muted"
            onClick={fetchAIPrediction}
          >
            <Calendar className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* AI Forecast Overlay */}
      {showForecast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white/95 backdrop-blur-sm p-6 overflow-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">AI-Powered Pollution Forecast</h2>
            <button
              onClick={() => setShowForecast(false)}
              className="rounded-full p-2 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {isForecastLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="ml-4 text-muted-foreground">Analyzing pollution patterns...</p>
            </div>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Next 24 Hours Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-60">
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between h-40 px-2">
                      {forecastData.map((point, index) => (
                        <div key={index} className="flex flex-col items-center w-1/8">
                          <div 
                            className={cn(
                              "w-full max-w-10 mx-auto rounded-t-sm transition-all duration-500",
                              point.isPrediction ? "opacity-70" : "opacity-100"
                            )}
                            style={{ 
                              height: `${Math.max(point.aqi / 2, 10)}px`,
                              background: point.aqi <= 50 
                                ? 'linear-gradient(to top, #4ade80, #86efac)' 
                                : point.aqi <= 100 
                                ? 'linear-gradient(to top, #fde047, #facc15)' 
                                : 'linear-gradient(to top, #f87171, #ef4444)'
                            }}
                          />
                          <div className="text-xs mt-2 text-muted-foreground">{point.hour}</div>
                          <div className={cn("text-xs font-medium", getAQITextColor(point.aqi))}>
                            {point.aqi}
                          </div>
                          {point.isPrediction && (
                            <div className="text-[10px] text-muted-foreground mt-1">AI</div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Separator line between actual and predicted data */}
                    <div className="absolute inset-y-0 left-[37.5%] border-l border-dashed border-muted-foreground/30" />
                    <div className="absolute top-0 left-[37.5%] -translate-x-1/2 bg-muted/90 text-xs px-2 py-1 rounded">
                      Now
                    </div>
                    <div className="absolute top-0 left-[37.5%] translate-x-2 bg-primary/10 text-xs px-2 py-1 rounded text-primary">
                      AI Prediction →
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Prediction Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-yellow-500" />
                        <span>Moderate pollution levels expected between 18:00-21:00</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-green-500" />
                        <span>Air quality improving overnight with best conditions at 06:00</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500" />
                        <span>Based on analysis of data from the last 7 days</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-red-500" />
                        <span>Limit outdoor activities between 18:00-21:00</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-green-500" />
                        <span>Ideal time for outdoor exercise: early morning (06:00)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500" />
                        <span>Keep windows closed during peak pollution hours</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Predictions are based on historical data and current weather conditions</p>
                <Button 
                  variant="default"
                  size="sm"
                  className="mx-auto"
                  onClick={() => setShowForecast(false)}
                >
                  Return to Map
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AirQualityMap;
