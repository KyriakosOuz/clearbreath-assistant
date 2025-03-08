
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Clock, Info, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useAirQuality, DataSource } from '@/hooks/use-air-quality';
import { cn } from '@/lib/utils';
import AQIScale from '@/components/AQIScale';
import AirQualitySourceSelector from '@/components/AirQualitySourceSelector';
import { Badge } from '@/components/ui/badge';
import { LocationPreferenceModal } from './LocationPreferenceModal';

interface AirQualityWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const getAQILevel = (aqi: number) => {
  if (aqi === 1) return 'good';
  if (aqi === 2) return 'moderate';
  if (aqi === 3) return 'unhealthy';
  if (aqi === 4) return 'hazardous';
  return 'severe';
};

const getAQIText = (level: string): string => {
  switch (level) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'unhealthy': return 'Unhealthy';
    case 'hazardous': return 'Hazardous';
    case 'severe': return 'Severe';
    default: return 'Unknown';
  }
};

const AirQualityWidget = ({ 
  latitude, 
  longitude, 
  className 
}: AirQualityWidgetProps) => {
  const [dataSource, setDataSource] = useState<DataSource>('combined');
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  
  const { 
    data, 
    openWeatherData, 
    waqiData,
    isLoading, 
    lastUpdated, 
    refetch 
  } = useAirQuality(
    latitude && longitude ? { lat: latitude, lon: longitude } : undefined,
    { source: dataSource }
  );
  
  const aqi = data?.aqi || 0;
  const level = getAQILevel(aqi);
  const levelText = getAQIText(level);
  const formattedTime = lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '';

  const handleSetPreferred = () => {
    if (data?.city) {
      // Store preference in local storage
      localStorage.setItem('airQualityPreferredLocation', JSON.stringify({
        name: data.city,
        lat: latitude,
        lon: longitude
      }));
      setShowPreferenceModal(false);
    }
  };
  
  const isCurrentLocationPreferred = () => {
    try {
      const stored = localStorage.getItem('airQualityPreferredLocation');
      if (!stored || !data?.city) return false;
      
      const preference = JSON.parse(stored);
      return preference.name === data.city;
    } catch (e) {
      return false;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-xl bg-white p-4 shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Air Quality</h3>
          {isLoading ? (
            <Skeleton className="h-6 w-40 mt-1" />
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              <span>{data?.city || 'Unknown Location'}</span>
              
              {isCurrentLocationPreferred() && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Preferred
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">About Air Quality Index</h4>
                <p className="text-sm text-muted-foreground">
                  The Air Quality Index (AQI) is a scale used to communicate how polluted the air is and what associated health effects might be.
                </p>
                <AQIScale compact />
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
      
      <AirQualitySourceSelector 
        source={dataSource} 
        onChange={setDataSource} 
      />
      
      <div className="mt-2">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-white',
                  {
                    'bg-aqi-good': level === 'good',
                    'bg-aqi-moderate': level === 'moderate',
                    'bg-aqi-unhealthy': level === 'unhealthy',
                    'bg-aqi-hazardous': level === 'hazardous',
                    'bg-aqi-severe': level === 'severe',
                  }
                )}
              >
                <span className="text-2xl font-bold">{aqi}</span>
              </div>
              <span className="mt-2 font-medium">{levelText}</span>
              
              {data?.source && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  <Database className="h-2.5 w-2.5 mr-1" />
                  {data.source}
                </Badge>
              )}
              
              {data?.station && (
                <span className="mt-1 text-[10px] text-muted-foreground">
                  Station: {data.station}
                </span>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2">
              {data?.pollutants && Object.entries(data.pollutants).slice(0, 3).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-muted/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">{key}</div>
                  <div className="font-medium">{Math.round(value * 10) / 10}</div>
                </div>
              ))}
            </div>
            
            {data?.dominantPollutant && (
              <div className="mt-3 text-xs text-center">
                <span className="text-muted-foreground">Dominant pollutant: </span>
                <span className="font-medium">{data.dominantPollutant}</span>
              </div>
            )}
            
            <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>Updated at {formattedTime}</span>
            </div>
            
            {!isCurrentLocationPreferred() && data?.city && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => setShowPreferenceModal(true)}
              >
                Set as Preferred Location
              </Button>
            )}
            
            <div className="mt-4 pt-3 border-t border-muted">
              <h4 className="text-xs font-medium mb-2">Source comparison</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">OpenWeather</div>
                  <div className="font-medium text-sm">
                    {openWeatherData ? openWeatherData.aqi : 'N/A'}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <div className="text-xs text-muted-foreground">WAQI</div>
                  <div className="font-medium text-sm">
                    {waqiData ? waqiData.aqi : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <LocationPreferenceModal 
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onConfirm={handleSetPreferred}
        locationName={data?.city || 'Unknown Location'}
      />
    </motion.div>
  );
};

export default AirQualityWidget;
