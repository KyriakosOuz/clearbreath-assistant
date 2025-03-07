
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, BarChart2, Bell, User, Heart, Activity } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import AirQualityCard from '@/components/AirQualityCard';
import HealthRecommendation from '@/components/HealthRecommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAirQuality } from '@/hooks/use-air-quality';

// Mock data for air quality
const mockAirQuality = {
  forecast: [
    { time: '12:00', aqi: 45 },
    { time: '14:00', aqi: 52 },
    { time: '16:00', aqi: 62 },
    { time: '18:00', aqi: 58 },
    { time: '20:00', aqi: 49 },
    { time: '22:00', aqi: 42 }
  ],
  nearby: [
    { location: 'Eastern District', aqi: 72, distance: '3.2 km' },
    { location: 'Harbor Area', aqi: 105, distance: '2.8 km' },
    { location: 'Western Suburbs', aqi: 38, distance: '4.5 km' }
  ]
};

// Health recommendations from AI
const mockAIRecommendations = [
  "Based on current air quality and your health metrics, it's a good day for light outdoor activities.",
  "Your heart rate has been optimal today. Continue your current activity level.",
  "Remember to stay hydrated to help your body naturally remove inhaled particles."
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: airQualityData } = useAirQuality();
  
  // Determine AQI level from AQI value
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy';
    if (aqi <= 300) return 'hazardous';
    return 'severe';
  };
  
  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get air quality data
  const aqi = airQualityData?.aqi || 42;
  const location = airQualityData?.city || 'Thessaloniki, City Center';
  const updatedAt = airQualityData?.time ? new Date(airQualityData.time).toLocaleTimeString() : '3 minutes ago';
  const pollutants = airQualityData?.pollutants || {
    'PM2.5': 12,
    'PM10': 24,
    'O3': 68,
    'NO2': 15
  };
  
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-heading">Dashboard</h1>
        </motion.div>
        
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isLoading ? (
              <div className="h-[250px] rounded-2xl bg-muted/20 animate-pulse" />
            ) : (
              <AirQualityCard 
                aqi={aqi}
                location={location}
                updatedAt={updatedAt}
                pollutants={pollutants}
              />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isLoading ? (
              <div className="h-[250px] rounded-2xl bg-muted/20 animate-pulse" />
            ) : (
              <HealthRecommendation 
                aqiLevel={getAQILevel(aqi) as 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe'} 
                pollutants={pollutants}
              />
            )}
          </motion.div>
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="forecast" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Forecast</span>
                </TabsTrigger>
                <TabsTrigger value="nearby" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Nearby Locations</span>
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Health Trends</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="forecast">
              {isLoading ? (
                <div className="h-[200px] rounded-xl bg-muted/20 animate-pulse" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="rounded-xl bg-white p-4 shadow-md"
                >
                  <h3 className="mb-4 text-lg font-medium">Today's Forecast</h3>
                  <div className="flex justify-between">
                    {mockAirQuality.forecast.map((item, index) => (
                      <motion.div
                        key={item.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-sm text-muted-foreground">{item.time}</span>
                        <div 
                          className={`mt-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            item.aqi <= 50 ? 'bg-aqi-good' : 
                            item.aqi <= 100 ? 'bg-aqi-moderate' : 
                            'bg-aqi-unhealthy'
                          }`}
                        >
                          <span className="text-sm font-medium text-white">{item.aqi}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="nearby">
              {isLoading ? (
                <div className="h-[200px] rounded-xl bg-muted/20 animate-pulse" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="rounded-xl bg-white p-4 shadow-md"
                >
                  <h3 className="mb-4 text-lg font-medium">Nearby Locations</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {mockAirQuality.nearby.map((item, index) => (
                      <motion.div
                        key={item.location}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className="rounded-lg bg-muted/20 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{item.location}</span>
                          <span 
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              item.aqi <= 50 ? 'bg-green-100 text-green-800' : 
                              item.aqi <= 100 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {item.aqi}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="mr-1 inline h-3 w-3" />
                          {item.distance} away
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="health">
              {isLoading ? (
                <div className="h-[200px] rounded-xl bg-muted/20 animate-pulse" />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="rounded-xl bg-white p-4 shadow-md"
                >
                  <h3 className="mb-4 text-lg font-medium">Your Health Trends</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="mr-2 h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Heart Rate (Average)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">78</span>
                        <span className="text-xs text-muted-foreground">BPM</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-300 to-red-500 w-[65%]"></div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Oxygen Level (Average)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">97</span>
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-red-300 to-green-500 w-[85%]"></div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground">Weekly Steps</div>
                          <div className="mt-1 text-xl font-semibold">47,230</div>
                          <div className="text-xs text-green-600">+12% from last week</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-3">
                          <div className="text-xs text-muted-foreground">AQI Exposure</div>
                          <div className="mt-1 text-xl font-semibold">63</div>
                          <div className="text-xs text-amber-600">Moderate avg. exposure</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
                    <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
                  </div>
                ) : (
                  <div className="rounded-lg border bg-muted/10 p-4">
                    <p className="text-center text-sm text-muted-foreground">
                      You have no new notifications
                    </p>
                    <Button variant="outline" className="mt-4 w-full">
                      Set up alerts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
                    <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
                    <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {mockAIRecommendations.map((recommendation, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                        className="rounded-lg bg-muted/10 px-4 py-3 text-sm"
                      >
                        {recommendation}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Dashboard;
