
import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useAirQuality, DataSource } from '@/hooks/use-air-quality';
import { cn } from '@/lib/utils';
import AQIScale from '@/components/AQIScale';
import AirQualitySourceSelector from '@/components/AirQualitySourceSelector';
import AirQualityDisplay from '@/components/AirQualityDisplay';
import AirQualitySourceComparison from '@/components/AirQualitySourceComparison';
import { LocationPreferenceModal } from './LocationPreferenceModal';
import { getAQILevel, getAQIText } from '@/utils/air-quality-utils';

interface AirQualityWidgetProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

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
    iqairData,
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
            <AirQualityDisplay
              aqi={aqi}
              level={level}
              levelText={levelText}
              source={data?.source}
              station={data?.station}
              dominantPollutant={data?.dominantPollutant}
              pollutants={data?.pollutants}
              formattedTime={formattedTime}
            />
            
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
            
            <AirQualitySourceComparison
              openWeatherData={openWeatherData}
              iqairData={iqairData}
            />
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
