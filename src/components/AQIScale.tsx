
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AQIScaleProps {
  className?: string;
  compact?: boolean;
}

const AQIScale = ({ className, compact = false }: AQIScaleProps) => {
  const levels = [
    { label: 'Good', color: 'bg-aqi-good', range: '0-50' },
    { label: 'Moderate', color: 'bg-aqi-moderate', range: '51-100' },
    { label: 'Unhealthy', color: 'bg-aqi-unhealthy', range: '101-150' },
    { label: 'Hazardous', color: 'bg-aqi-hazardous', range: '151-300' },
    { label: 'Severe', color: 'bg-aqi-severe', range: '301+' },
  ];

  return (
    <div className={cn('rounded-lg bg-white/80 p-4 shadow-md', className)}>
      <h4 className="mb-3 text-sm font-medium">Air Quality Index Scale</h4>
      <div className="flex w-full">
        {levels.map((level, index) => (
          <motion.div
            key={level.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex-1"
          >
            <div className={cn('h-2 w-full', level.color)} />
            {!compact && (
              <div className="mt-1 text-center">
                <p className="text-xs font-medium">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.range}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AQIScale;
