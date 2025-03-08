import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import AirQualityCard from '@/components/AirQualityCard';
import AQIScale from '@/components/AQIScale';
import HealthRecommendation from '@/components/HealthRecommendation';
import { Button } from '@/components/ui/button';
import { useRealTimeAirQuality } from '@/hooks/use-real-time-air-quality';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({
    lat: 40.6403,
    lon: 22.9439
  });
  const { user, isLoaded } = useUser();
  
  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // We're keeping the default Thessaloniki coordinates even if we get user's location
          console.log('Using default Thessaloniki location instead of user location');
        },
        (error) => {
          console.log('Error getting location:', error);
          // Already defaulted to Thessaloniki
        }
      );
    }
  }, []);
  
  // Fetch real-time air quality data using our custom hook
  const { data: airQualityData, isLoading, error, refreshData } = useRealTimeAirQuality(
    userLocation.lat,
    userLocation.lon,
    { disableNotifications: true, locationName: 'Thessaloniki, Greece' }
  );
  
  // Show error toast if data fetch fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch air quality data', {
        description: error,
        action: {
          label: 'Retry',
          onClick: () => refreshData()
        }
      });
    }
  }, [error, refreshData]);
  
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <section className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Bell className="mr-1 h-3 w-3" />
              Real-time Air Quality Monitoring
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Breathe Easier with AirAlert
            </h1>
            <p className="mb-8 text-muted-foreground">
              Monitor air quality in real-time, receive personalized health recommendations, 
              and get notifications when pollution levels rise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/map">View Air Quality Map</Link>
              </Button>
            </div>
          </motion.div>
        </section>
        
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 text-center text-2xl font-bold"
            >
              {isLoaded && user 
                ? `Current Air Quality for ${user.firstName || 'You'}`
                : 'Current Air Quality'}
            </motion.h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {isLoading ? (
                <>
                  <div className="h-[250px] rounded-2xl bg-muted/20 animate-pulse" />
                  <div className="h-[250px] rounded-2xl bg-muted/20 animate-pulse" />
                </>
              ) : error ? (
                <div className="md:col-span-2">
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      We're having trouble connecting to our air quality services. 
                      Please try again later or check your internet connection.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={refreshData} className="w-full">
                    Retry Loading Air Quality Data
                  </Button>
                </div>
              ) : (
                <>
                  <AirQualityCard 
                    aqi={airQualityData?.aqi || 0}
                    location={airQualityData?.location || 'Unknown Location'}
                    updatedAt={airQualityData?.updatedAt || 'Unknown'}
                    pollutants={airQualityData?.pollutants || {}}
                  />
                  <HealthRecommendation aqiLevel={airQualityData?.category || 'good'} />
                </>
              )}
            </div>
            
            {userLocation && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 text-center text-sm text-muted-foreground"
              >
                <p>Showing data for {airQualityData?.location || 'your current location'}</p>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoading || error ? 0 : 1, y: isLoading || error ? 20 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              <AQIScale />
            </motion.div>
          </div>
        </section>
        
        <section className="mb-12">
          <div className="mx-auto max-w-4xl">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6 text-center text-2xl font-bold"
            >
              Key Features
            </motion.h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Real-time Monitoring',
                  description: 'Get up-to-date air quality data from multiple stations across your area.',
                  delay: 0.7
                },
                {
                  title: 'Health Recommendations',
                  description: 'Receive personalized advice based on current pollution levels and your health profile.',
                  delay: 0.8
                },
                {
                  title: 'Smart Notifications',
                  description: 'Get alerts when air quality drops below acceptable levels in your area.',
                  delay: 0.9
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="glass-card rounded-xl p-6"
                >
                  <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  );
};

export default Index;
