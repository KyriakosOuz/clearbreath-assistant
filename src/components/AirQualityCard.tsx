import { motion } from 'framer-motion';
import { MapPin, Clock, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import AirQualityStatusRing from './AirQualityStatusRing';
import AirQualityAttributions from './AirQualityAttributions';

type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';

interface AirQualityCardProps {
  aqi: number;
  location: string;
  updatedAt: string;
  pollutants?: {
    [key: string]: number;
  };
  source?: string;
  attributions?: Array<{
    name: string;
    url: string;
  }>;
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

const AirQualityCard = ({ 
  aqi, 
  location, 
  updatedAt, 
  pollutants, 
  source,
  attributions,
  className 
}: AirQualityCardProps) => {
  const level = getAQILevel(aqi);
  const levelText = getAQIText(level);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br from-white/80 to-white/60',
        'backdrop-blur-sm shadow-xl',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-[0.08]" 
        style={{
          backgroundImage: `linear-gradient(to bottom right, 
            ${level === 'good' ? '#4ade80, #22c55e' : 
              level === 'moderate' ? '#facc15, #eab308' : 
              level === 'unhealthy' ? '#f97316, #ea580c' : 
              level === 'hazardous' ? '#ef4444, #dc2626' : 
              '#7e22ce, #6b21a8'})`
        }}
      />
      
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xl font-medium">
              <MapPin className="h-5 w-5" />
              <h3>{location}</h3>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p>Updated {updatedAt}</p>
            </div>
            {source && (
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Database className="h-3 w-3" />
                <p>Source: {source}</p>
              </div>
            )}
          </div>
          
          <AirQualityStatusRing 
            aqi={aqi} 
            level={level} 
            size="lg"
          />
        </div>
        
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'inline-block rounded-full px-4 py-1 text-sm font-medium',
              {
                'bg-green-100 text-green-700': level === 'good',
                'bg-yellow-100 text-yellow-700': level === 'moderate',
                'bg-orange-100 text-orange-700': level === 'unhealthy',
                'bg-red-100 text-red-700': level === 'hazardous',
                'bg-purple-100 text-purple-700': level === 'severe',
              }
            )}
          >
            {levelText}
          </motion.div>
        </div>
        
        {pollutants && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            {Object.entries(pollutants).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="rounded-xl bg-white/40 p-3 backdrop-blur-sm"
              >
                <span className="text-sm font-medium">{key}</span>
                <p className="mt-1 text-2xl font-semibold">{value}
                  <span className="ml-1 text-xs text-muted-foreground">µg/m³</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <AirQualityAttributions attributions={attributions} className="mt-2" />
      </div>
    </motion.div>
  );
};

export default AirQualityCard;
