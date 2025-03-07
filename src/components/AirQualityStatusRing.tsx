
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AirQualityStatusRingProps {
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AirQualityStatusRing = ({ aqi, level, size = 'md', className }: AirQualityStatusRingProps) => {
  const sizeClasses = {
    sm: 'h-16 w-16 text-2xl',
    md: 'h-24 w-24 text-3xl',
    lg: 'h-32 w-32 text-4xl'
  };

  return (
    <div className={cn('relative', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className={cn(
          'relative flex items-center justify-center rounded-full',
          'bg-gradient-to-br from-white/80 to-white/40',
          'shadow-lg backdrop-blur-sm',
          sizeClasses[size]
        )}
      >
        <div 
          className={cn(
            'absolute inset-1 rounded-full',
            'bg-gradient-to-br',
            {
              'from-green-300 to-green-500': level === 'good',
              'from-yellow-300 to-yellow-500': level === 'moderate',
              'from-orange-300 to-orange-500': level === 'unhealthy',
              'from-red-300 to-red-500': level === 'hazardous',
              'from-purple-300 to-purple-500': level === 'severe',
            }
          )}
          style={{ opacity: 0.15 }}
        />
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'font-bold',
            {
              'text-green-700': level === 'good',
              'text-yellow-700': level === 'moderate',
              'text-orange-700': level === 'unhealthy',
              'text-red-700': level === 'hazardous',
              'text-purple-700': level === 'severe',
            }
          )}
        >
          {aqi}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AirQualityStatusRing;
