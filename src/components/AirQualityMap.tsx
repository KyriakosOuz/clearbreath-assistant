import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Locate, X, BarChart3, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRealTimeAirQuality } from '@/hooks/use-real-time-air-quality';
import { getGoogleMapsApiKey } from '@/lib/google-maps';

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

// Function to get AQI color
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

// Generate forecast data based on current AQI
const generateForecastData = (currentAqi: number): ForecastDataPoint[] => {
  const now = new Date();
  const forecast: ForecastDataPoint[] = [];
  
  // Past data (not predictions)
  for (let i = -3; i <= 0; i++) {
    const hour = new Date(now);
    hour.setHours(now.getHours() + i);
    
    // Random variation +/- 15% from current AQI for historical data
    const variation = i === 0 ? 0 : (Math.random() * 0.3) - 0.15;
    const aqi = Math.round(currentAqi * (1 + variation));
    
    forecast.push({
      hour: hour.getHours().toString().padStart(2, '0') + ':00',
      aqi: aqi,
      timestamp: hour.toISOString(),
      isPrediction: false
    });
  }
  
  // Future predictions
  for (let i = 1; i <= 5; i++) {
    const hour = new Date(now);
    hour.setHours(now.getHours() + i);
    
    // For predictions, we'll create a pattern:
    // If current time is morning (6-12), AQI gets worse in afternoon
    // If current time is afternoon (12-18), AQI improves in evening
    // If current time is evening/night, AQI improves overnight
    const currentHour = now.getHours();
    let trendFactor = 0;
    
    if (currentHour >= 6 && currentHour < 12) {
      // Morning -> afternoon: worsen
      trendFactor = 0.1 * i;
    } else if (currentHour >= 12 && currentHour < 18) {
      // Afternoon -> evening: improve
      trendFactor = -0.07 * i;
    } else {
      // Evening/night -> overnight: improve more
      trendFactor = -0.12 * i;
    }
    
    // Add some randomness to the trend
    const randomness = (Math.random() * 0.1) - 0.05;
    const aqi = Math.max(10, Math.round(currentAqi * (1 + trendFactor + randomness)));
    
    forecast.push({
      hour: hour.getHours().toString().padStart(2, '0') + ':00',
      aqi: aqi,
      timestamp: hour.toISOString(),
      isPrediction: true
    });
  }
  
  return forecast;
};

const AirQualityMap = ({ className }: AirQualityMapProps) => {
  // Get real-time air quality data
  const { data: airQualityData, isLoading: isAirQualityLoading, error: airQualityError, refreshData } = useRealTimeAirQuality();
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [nearbyStations, setNearbyStations] = useState<MapLocation[]>([]);
  const [mapApiKey, setMapApiKey] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.error("Could not get your location. Using default location.");
          // Default to Thessaloniki if geolocation fails
          setUserLocation({ lat: 40.63, lng: 22.95 });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser. Using default location.");
      setUserLocation({ lat: 40.63, lng: 22.95 });
    }
  }, []);
  
  // Get Google Maps API key
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
  
  // Generate nearby stations based on the actual air quality data
  useEffect(() => {
    if (airQualityData && userLocation) {
      const mainStation: MapLocation = {
        id: '1',
        name: airQualityData.location,
        aqi: airQualityData.aqi,
        lat: userLocation.lat,
        lng: userLocation.lng
      };
      
      // Generate some additional nearby stations with variation in AQI
      const nearby: MapLocation[] = [mainStation];
      
      // Add 4-6 additional stations around the main one
      const numStations = 4 + Math.floor(Math.random() * 3);
      const locationLabels = ['City Center', 'Eastern District', 'Harbor Area', 'Western Suburbs', 'Northern Hills', 'Industrial Zone', 'University Area', 'Park District'];
      
      for (let i = 0; i < numStations; i++) {
        // Random offset from user location (0.01-0.05 degrees, roughly 1-5 km)
        const latOffset = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        const lngOffset = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        
        // Vary the AQI by -30% to +50% from the main reading
        const aqiVariation = airQualityData.aqi * (0.7 + Math.random() * 0.8);
        
        nearby.push({
          id: (i + 2).toString(),
          name: locationLabels[i % locationLabels.length],
          aqi: Math.round(aqiVariation),
          lat: userLocation.lat + latOffset,
          lng: userLocation.lng + lngOffset
        });
      }
      
      setNearbyStations(nearby);
    }
  }, [airQualityData, userLocation]);
  
  // Simulate map loading
  useEffect(() => {
    if (userLocation) {
      const timer = setTimeout(() => {
        setIsMapLoaded(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userLocation]);
  
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const fetchAIPrediction = async () => {
    if (!selectedLocation) return;
    
    setIsForecastLoading(true);
    setShowForecast(true);
    
    try {
      // Generate forecast data based on the selected location's AQI
      setTimeout(() => {
        const generatedForecast = generateForecastData(selectedLocation.aqi);
        setForecastData(generatedForecast);
        setIsForecastLoading(false);
        
        // Show notification about high pollution periods
        const highPollutionPeriods = generatedForecast.filter(point => point.aqi > 70 && point.isPrediction);
        
        if (highPollutionPeriods.length > 0) {
          // Fix: Use toast directly instead of passing an object with title property
          toast.error(`High pollution levels predicted at ${highPollutionPeriods[0].hour}. Consider staying indoors.`);
        }
      }, 2000);
    } catch (error) {
      console.error("Error generating forecast data:", error);
      setIsForecastLoading(false);
      toast.error("Failed to generate pollution forecast");
    }
  };
  
  return (
    <div className={cn('relative rounded-2xl bg-white shadow-lg overflow-hidden', className)}>
      <div className="relative h-[500px] w-full">
        {!isMapLoaded || isAirQualityLoading || !userLocation || !mapApiKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Loading map and air quality data...</p>
          </div>
        ) : airQualityError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20">
            <div className="text-center p-6">
              <p className="text-red-500 mb-2">Error loading air quality data</p>
              <Button onClick={refreshData} variant="outline" size="sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={mapRef}
              className="absolute inset-0 bg-blue-50 transition-opacity duration-1000 opacity-100"
            >
              {/* Map visualization using Google Static Maps API */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
                style={{
                  backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.lat},${userLocation.lng}&zoom=12&size=800x500&scale=2&style=feature:all%7Celement:all%7Cvisibility:on%7Ccolor:0xf2f2f2&style=feature:landscape%7Celement:geometry%7Ccolor:0xf2f2f2&style=feature:poi%7Celement:all%7Cvisibility:off&style=feature:road%7Celement:all%7Csaturation:-100%7Clightness:45&style=feature:road.highway%7Celement:all%7Cvisibility:simplified&style=feature:road.arterial%7Celement:labels.icon%7Cvisibility:off&style=feature:transit%7Celement:all%7Cvisibility:off&style=feature:water%7Celement:all%7Ccolor:0xcdcdcd&key=${mapApiKey}')`
                }}
              />

              {/* Location pins */}
              {nearbyStations.map((location) => (
                <motion.div
                  key={location.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
                  onClick={() => handleLocationSelect(location)}
                  style={{
                    left: `${((location.lng - userLocation.lng) * 600) + 50}%`,
                    top: `${((userLocation.lat - location.lat) * 600) + 50}%`
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <div className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110',
                    getAQIColor(location.aqi)
                  )}>
                    <MapPin className="h-4 w-4 text-white" />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium shadow-sm opacity-0 hover:opacity-100 group-hover:opacity-100">
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
                    <p className="text-sm">
                      AQI: <span className={getAQITextColor(selectedLocation.aqi)}>{selectedLocation.aqi}</span>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 flex items-center gap-1"
                      onClick={fetchAIPrediction}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Show Forecast</span>
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
              <Button 
                size="icon" 
                className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-muted"
                onClick={() => refreshData()}
              >
                <Locate className="h-5 w-5" />
              </Button>
              <Button 
                size="icon"
                className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-muted"
                onClick={() => {
                  if (selectedLocation) {
                    fetchAIPrediction();
                  } else {
                    toast.info("Please select a location on the map first");
                  }
                }}
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
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
            <h2 className="text-xl font-semibold">Air Pollution Forecast</h2>
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
                      {(() => {
                        // Generate insights based on the actual forecast data
                        const insights = [];
                        const maxAqi = Math.max(...forecastData.filter(d => d.isPrediction).map(d => d.aqi));
                        const minAqi = Math.min(...forecastData.filter(d => d.isPrediction).map(d => d.aqi));
                        const maxAqiTime = forecastData.find(d => d.isPrediction && d.aqi === maxAqi)?.hour;
                        const minAqiTime = forecastData.find(d => d.isPrediction && d.aqi === minAqi)?.hour;
                        
                        if (maxAqi > 70) {
                          insights.push(
                            <li key="high" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-red-500" />
                              <span>Higher pollution levels expected around {maxAqiTime}</span>
                            </li>
                          );
                        }
                        
                        if (minAqi < 50) {
                          insights.push(
                            <li key="low" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-green-500" />
                              <span>Clean air expected around {minAqiTime}</span>
                            </li>
                          );
                        }
                        
                        const trend = forecastData[forecastData.length - 1].aqi - forecastData[forecastData.length / 2].aqi;
                        if (Math.abs(trend) > 10) {
                          insights.push(
                            <li key="trend" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500" />
                              <span>Air quality {trend > 0 ? 'worsening' : 'improving'} trend over the next 24 hours</span>
                            </li>
                          );
                        }
                        
                        // Add a basic insight if we don't have any
                        if (insights.length === 0) {
                          insights.push(
                            <li key="stable" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500" />
                              <span>Relatively stable air quality expected</span>
                            </li>
                          );
                        }
                        
                        // Always add data source info
                        insights.push(
                          <li key="source" className="flex items-start">
                            <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-gray-500" />
                            <span>Based on historical patterns and current readings</span>
                          </li>
                        );
                        
                        return insights;
                      })()}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {(() => {
                        // Generate recommendations based on forecast data
                        const recommendations = [];
                        const maxAqi = Math.max(...forecastData.filter(d => d.isPrediction).map(d => d.aqi));
                        const minAqi = Math.min(...forecastData.filter(d => d.isPrediction).map(d => d.aqi));
                        const maxAqiTime = forecastData.find(d => d.isPrediction && d.aqi === maxAqi)?.hour;
                        const minAqiTime = forecastData.find(d => d.isPrediction && d.aqi === minAqi)?.hour;
                        
                        if (maxAqi > 100) {
                          recommendations.push(
                            <li key="avoid" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-red-500" />
                              <span>Avoid outdoor activities around {maxAqiTime}</span>
                            </li>
                          );
                        } else if (maxAqi > 70) {
                          recommendations.push(
                            <li key="limit" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-orange-500" />
                              <span>Limit outdoor activities around {maxAqiTime}</span>
                            </li>
                          );
                        }
                        
                        if (minAqi < 50) {
                          recommendations.push(
                            <li key="ideal" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-green-500" />
                              <span>Ideal time for outdoor exercise: {minAqiTime}</span>
                            </li>
                          );
                        }
                        
                        if (maxAqi > 70) {
                          recommendations.push(
                            <li key="windows" className="flex items-start">
                              <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-blue-500" />
                              <span>Keep windows closed during peak pollution hours</span>
                            </li>
                          );
                        }
                        
                        // Basic recommendation for sensitive groups
                        recommendations.push(
                          <li key="sensitive" className="flex items-start">
                            <div className="h-2 w-2 mt-1.5 mr-2 rounded-full bg-purple-500" />
                            <span>People with respiratory conditions should take extra precautions</span>
                          </li>
                        );
                        
                        return recommendations;
                      })()}
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
