import React from 'react';
import { useAuthProtect } from '@/hooks/use-auth-protect';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Users, Wind, Droplets, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Sample data for charts
const airQualityData = [
  { time: '00:00', aqi: 42 },
  { time: '04:00', aqi: 38 },
  { time: '08:00', aqi: 45 },
  { time: '12:00', aqi: 65 },
  { time: '16:00', aqi: 58 },
  { time: '20:00', aqi: 52 },
  { time: '24:00', aqi: 48 },
];

const weeklyData = [
  { day: 'Mon', aqi: 45, exposure: 35 },
  { day: 'Tue', aqi: 52, exposure: 40 },
  { day: 'Wed', aqi: 49, exposure: 38 },
  { day: 'Thu', aqi: 63, exposure: 55 },
  { day: 'Fri', aqi: 58, exposure: 50 },
  { day: 'Sat', aqi: 40, exposure: 30 },
  { day: 'Sun', aqi: 42, exposure: 32 },
];

const pollutantData = [
  { name: 'PM2.5', value: 18, limit: 35, unit: 'μg/m³' },
  { name: 'PM10', value: 42, limit: 50, unit: 'μg/m³' },
  { name: 'O3', value: 68, limit: 100, unit: 'ppb' },
  { name: 'NO2', value: 15, limit: 53, unit: 'ppb' },
  { name: 'SO2', value: 3, limit: 75, unit: 'ppb' },
  { name: 'CO', value: 0.8, limit: 9, unit: 'ppm' },
];

const locationData = [
  { name: 'Home', aqi: 42, trend: 'down' },
  { name: 'Work', aqi: 58, trend: 'up' },
  { name: 'Gym', aqi: 45, trend: 'down' },
  { name: 'Park', aqi: 38, trend: 'down' },
];

const Dashboard = () => {
  // Protect this route - only authenticated users can access
  const { isLoaded, isSignedIn } = useAuthProtect();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, {user?.firstName || 'User'}! Here's your air quality overview.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => {
              toast({
                title: "Report Generated",
                description: "Your air quality report has been sent to your email",
              });
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current AQI</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52</div>
              <p className="text-xs text-muted-foreground">Moderate</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div className="h-1.5 w-[52%] rounded-full bg-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Exposure</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38%</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                <span>12% less than average</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Main Pollutant</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PM2.5</div>
              <div className="flex items-center text-xs text-red-600">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>18 μg/m³ (Above WHO limit)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">62%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Comfortable range</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="mt-6">
          <TabsList>
            <TabsTrigger value="daily">Daily Trend</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Analysis</TabsTrigger>
            <TabsTrigger value="pollutants">Pollutants</TabsTrigger>
            <TabsTrigger value="locations">My Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Air Quality Index (24 Hours)</CardTitle>
                <CardDescription>
                  Today's AQI measurements throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={airQualityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="aqi" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Air Quality Comparison</CardTitle>
                <CardDescription>
                  AQI levels and your exposure over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="aqi" name="AQI Level" fill="#8884d8" />
                      <Bar dataKey="exposure" name="Your Exposure" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pollutants" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pollutant Breakdown</CardTitle>
                <CardDescription>
                  Current levels of individual pollutants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pollutantData.map((pollutant) => (
                    <div key={pollutant.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{pollutant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {pollutant.value} {pollutant.unit} / {pollutant.limit} {pollutant.unit}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            pollutant.value > pollutant.limit * 0.8 ? "bg-red-500" : 
                            pollutant.value > pollutant.limit * 0.5 ? "bg-yellow-500" : "bg-green-500"
                          )}
                          style={{ width: `${(pollutant.value / pollutant.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Saved Locations</CardTitle>
                <CardDescription>
                  Current air quality at your frequent locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationData.map((location) => (
                    <div key={location.name} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-muted-foreground">Updated 10 minutes ago</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold">{location.aqi}</div>
                        <div className={cn(
                          "flex items-center text-sm",
                          location.trend === 'up' ? "text-red-600" : "text-green-600"
                        )}>
                          {location.trend === 'up' ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          <span>{location.trend === 'up' ? 'Rising' : 'Falling'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Dashboard;
