
import { motion } from 'framer-motion';
import { Heart, Activity, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';

interface HealthRecommendationProps {
  aqiLevel: AirQualityLevel;
  className?: string;
}

const getRecommendations = (level: AirQualityLevel) => {
  switch (level) {
    case 'good':
      return {
        general: "Air quality is good. Enjoy outdoor activities.",
        sensitive: "No special precautions needed for sensitive groups.",
        icon: User,
        color: 'text-green-600'
      };
    case 'moderate':
      return {
        general: "Air quality is acceptable. Consider reducing prolonged outdoor exertion for sensitive individuals.",
        sensitive: "People with respiratory issues should monitor symptoms.",
        icon: Activity,
        color: 'text-yellow-600'
      };
    case 'unhealthy':
      return {
        general: "Reduce prolonged or heavy outdoor exertion. Take more breaks during outdoor activities.",
        sensitive: "People with heart or lung disease should avoid outdoor physical activity.",
        icon: Heart,
        color: 'text-orange-600'
      };
    case 'hazardous':
      return {
        general: "Avoid all outdoor physical activities. Move activities indoors or reschedule.",
        sensitive: "People with heart or lung disease should remain indoors and keep activity levels low.",
        icon: Shield,
        color: 'text-red-600'
      };
    case 'severe':
      return {
        general: "Remain indoors and keep activity levels low. Follow advice of local health officials.",
        sensitive: "Emergency conditions for sensitive groups. Avoid all physical activity outdoors.",
        icon: Shield,
        color: 'text-purple-600'
      };
  }
};

const HealthRecommendation = ({ aqiLevel, className }: HealthRecommendationProps) => {
  const { general, sensitive, icon: Icon, color } = getRecommendations(aqiLevel);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-2xl bg-white/90 p-6 shadow-lg',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={cn('rounded-full p-2', `bg-${color.split('-')[1]}-100`)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <h3 className="text-lg font-medium">Health Recommendations</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium">General Population</h4>
          <p className="mt-1 text-sm text-muted-foreground">{general}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium">Sensitive Groups</h4>
          <p className="mt-1 text-sm text-muted-foreground">{sensitive}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthRecommendation;
