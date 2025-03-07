
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAirQuality } from '@/hooks/use-air-quality';

interface AirQualityForecastProps {
  className?: string;
}

const getAQIColor = (aqi: number): string => {
  if (aqi === 1) return 'bg-aqi-good';
  if (aqi === 2) return 'bg-aqi-moderate';
  if (aqi === 3) return 'bg-aqi-unhealthy';
  if (aqi === 4) return 'bg-aqi-hazardous';
  if (aqi === 5) return 'bg-aqi-severe';
  return 'bg-muted';
};

const getAQITextColor = (aqi: number): string => {
  if (aqi === 1) return 'text-green-600';
  if (aqi === 2) return 'text-yellow-600';
  if (aqi === 3) return 'text-orange-600';
  if (aqi === 4) return 'text-red-600';
  if (aqi === 5) return 'text-purple-600';
  return 'text-muted-foreground';
};

const AirQualityForecast = ({ className }: AirQualityForecastProps) => {
  const { data, isLoading } = useAirQuality();
  const [activeTab, setActiveTab] = useState('hourly');
  
  const hourlyForecast = data?.forecast?.hourly || [];
  
  // Detect if trend is improving or worsening
  const firstAQI = hourlyForecast[0]?.aqi || 0;
  const lastAQI = hourlyForecast[hourlyForecast.length - 1]?.aqi || 0;
  const isTrendImproving = lastAQI < firstAQI;
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Air Quality Forecast</span>
          </div>
          
          {!isLoading && hourlyForecast.length > 0 && (
            <div className={cn(
              "flex items-center text-sm",
              isTrendImproving ? "text-green-600" : "text-red-600"
            )}>
              {isTrendImproving ? (
                <>
                  <TrendingDown className="mr-1 h-4 w-4" />
                  <span>Improving</span>
                </>
              ) : (
                <>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span>Worsening</span>
                </>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="hourly" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly" className="gap-1">
              <Clock className="h-4 w-4" />
              <span>Hourly</span>
            </TabsTrigger>
            <TabsTrigger value="pollutants" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Pollutants</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-4">
            {isLoading ? (
              <div className="flex justify-between gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Skeleton className="h-4 w-12 mb-2" />
                    <Skeleton className="h-12 w-12 rounded-full mb-1" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            ) : hourlyForecast.length > 0 ? (
              <div className="flex justify-between">
                {hourlyForecast.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs text-muted-foreground mb-1">
                      {item.hour}
                    </span>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        getAQIColor(item.aqi)
                      )}
                    >
                      <span className="text-sm font-medium text-white">
                        {item.aqi}
                      </span>
                    </div>
                    <span className={cn(
                      "mt-1 text-xs font-medium",
                      getAQITextColor(item.aqi)
                    )}>
                      {item.aqi === 1 ? 'Good' : 
                       item.aqi === 2 ? 'Fair' : 
                       item.aqi === 3 ? 'Poor' : 
                       item.aqi === 4 ? 'Bad' : 'Very Bad'}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No forecast data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pollutants" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : hourlyForecast.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(hourlyForecast[0].components).map(([key, _], idx) => {
                  const pollutantName = 
                    key === 'pm2_5' ? 'PM2.5' :
                    key === 'pm10' ? 'PM10' :
                    key === 'o3' ? 'Ozone (O₃)' :
                    key === 'no2' ? 'Nitrogen Dioxide (NO₂)' :
                    key === 'so2' ? 'Sulfur Dioxide (SO₂)' :
                    key === 'co' ? 'Carbon Monoxide (CO)' :
                    key;
                  
                  // Get average value for this pollutant over the forecast period
                  const values = hourlyForecast.map(item => item.components[key]);
                  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                  
                  return (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{pollutantName}</span>
                        <span className="text-sm">
                          {Math.round(avgValue * 100) / 100}
                          <span className="ml-1 text-xs text-muted-foreground">μg/m³</span>
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((avgValue / (key === 'co' ? 15000 : 200)) * 100, 100)}%` }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No pollutant data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AirQualityForecast;
