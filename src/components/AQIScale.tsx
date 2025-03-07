
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AQIScaleProps {
  className?: string;
  compact?: boolean;
}

const AQIScale = ({ className, compact = false }: AQIScaleProps) => {
  const levels = [
    { label: 'Good', color: 'bg-aqi-good', textColor: 'text-green-700', range: '0-50' },
    { label: 'Moderate', color: 'bg-aqi-moderate', textColor: 'text-yellow-700', range: '51-100' },
    { label: 'Unhealthy', color: 'bg-aqi-unhealthy', textColor: 'text-orange-700', range: '101-150' },
    { label: 'Hazardous', color: 'bg-aqi-hazardous', textColor: 'text-red-700', range: '151-300' },
    { label: 'Severe', color: 'bg-aqi-severe', textColor: 'text-purple-700', range: '301+' },
  ];

  return (
    <div className={cn(
      'rounded-xl bg-white/80 p-4 backdrop-blur-sm shadow-lg',
      'border border-white/20',
      className
    )}>
      <h4 className="mb-4 text-sm font-medium">Air Quality Index Scale</h4>
      <div className="flex w-full gap-1">
        {levels.map((level, index) => (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex-1"
          >
            <div className={cn(
              'h-3 w-full rounded-full transition-transform hover:scale-105',
              level.color
            )} />
            {!compact && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="mt-2 text-center"
              >
                <p className={cn("text-sm font-medium", level.textColor)}>{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.range}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AQIScale;
