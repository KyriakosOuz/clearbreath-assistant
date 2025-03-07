
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';

interface AirQualityCardProps {
  aqi: number;
  location: string;
  updatedAt: string;
  pollutants?: {
    [key: string]: number;
  };
  className?: string;
}

const getAQILevel = (aqi: number): AirQualityLevel => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 300) return 'hazardous';
  return 'severe';
};

const getAQIText = (level: AirQualityLevel): string => {
  switch (level) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'unhealthy': return 'Unhealthy';
    case 'hazardous': return 'Hazardous';
    case 'severe': return 'Severe';
  }
};

const AirQualityCard = ({ aqi, location, updatedAt, pollutants, className }: AirQualityCardProps) => {
  const level = getAQILevel(aqi);
  const levelText = getAQIText(level);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl p-6 shadow-lg card-hover',
        `aq-bg-${level}`,
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-medium">{location}</h3>
            <p className="text-sm text-muted-foreground">Updated {updatedAt}</p>
          </div>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full',
              'bg-white/80 backdrop-blur-sm shadow-md'
            )}
          >
            <span className={cn('text-xl font-bold', `aq-text-${level}`)}>{aqi}</span>
          </motion.div>
        </div>
        
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={cn('text-sm font-medium', `aq-text-${level}`)}>{levelText}</span>
            <span className="text-xs text-muted-foreground">AQI</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(aqi / 3, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={cn(
                'aqi-indicator',
                {
                  'bg-aqi-good': level === 'good',
                  'bg-aqi-moderate': level === 'moderate',
                  'bg-aqi-unhealthy': level === 'unhealthy',
                  'bg-aqi-hazardous': level === 'hazardous',
                  'bg-aqi-severe': level === 'severe',
                }
              )}
            />
          </div>
        </div>
        
        {pollutants && (
          <div className="mt-2 grid grid-cols-2 gap-3">
            {Object.entries(pollutants).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-white/40 p-2">
                <span className="text-xs text-muted-foreground">{key}</span>
                <p className="font-medium">{value} µg/m³</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AirQualityCard;
