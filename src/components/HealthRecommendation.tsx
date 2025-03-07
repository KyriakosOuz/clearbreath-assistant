
import { motion } from 'framer-motion';
import { Heart, Activity, User, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';

interface HealthRecommendationProps {
  aqiLevel: AirQualityLevel;
  className?: string;
  heartRate?: number;
  oxygenLevel?: number;
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

// Mock smartwatch data - would be fetched from real APIs
const mockSmartWatchData = {
  heartRate: 85,
  oxygenLevel: 95,
  steps: 6500,
  lastUpdated: '2 minutes ago'
};

const HealthRecommendation = ({ 
  aqiLevel, 
  className,
  heartRate = mockSmartWatchData.heartRate,
  oxygenLevel = mockSmartWatchData.oxygenLevel 
}: HealthRecommendationProps) => {
  const { general, sensitive, icon: Icon, color } = getRecommendations(aqiLevel);
  const { toast } = useToast();
  const [hasShownHealthWarning, setHasShownHealthWarning] = useState(false);
  
  // Function to generate AI recommendation based on health data
  const generateAIRecommendation = () => {
    // In a real implementation, this would call Mistral AI
    // For now, we'll use conditional logic to simulate AI responses

    // Simulate the AI generating personalized health advice
    let aiRecommendation = "";
    
    if (heartRate > 100 && aqiLevel !== 'good') {
      // High heart rate + poor air quality
      aiRecommendation = "Your elevated heart rate combined with current air quality suggests possible respiratory stress. Consider moving indoors, staying hydrated, and monitoring your symptoms.";
      
      toast({
        variant: "emergency",
        title: "Health Alert: Elevated Heart Rate",
        description: aiRecommendation,
      });
      
      if (aqiLevel === 'hazardous' || aqiLevel === 'severe') {
        // Simulate emergency alert
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "EMERGENCY ALERT",
            description: "Dangerous conditions detected. Your emergency contacts have been notified of your location.",
          });
        }, 3000);
      }
    } else if (oxygenLevel < 94 && (aqiLevel === 'unhealthy' || aqiLevel === 'hazardous' || aqiLevel === 'severe')) {
      // Low oxygen + poor air quality
      aiRecommendation = "Your oxygen levels are below optimal range and air quality is poor. Please move to a well-ventilated indoor location, reduce physical activity, and consider using supplemental oxygen if prescribed.";
      
      toast({
        variant: "emergency",
        title: "Health Alert: Low Oxygen Levels",
        description: aiRecommendation,
      });
    } else if (aqiLevel === 'moderate' || aqiLevel === 'unhealthy') {
      // Moderate conditions
      aiRecommendation = "Based on current air quality and your health metrics, consider staying hydrated and taking regular breaks if spending time outdoors.";
      
      toast({
        variant: "health",
        title: "Health Recommendation",
        description: aiRecommendation,
      });
    }
    
    return aiRecommendation;
  };
  
  // Check health status on load and when conditions change
  useEffect(() => {
    // Don't show alerts on first render to avoid overwhelming the user
    if (!hasShownHealthWarning && (
      (heartRate > 100 && aqiLevel !== 'good') || 
      (oxygenLevel < 94 && aqiLevel !== 'good')
    )) {
      generateAIRecommendation();
      setHasShownHealthWarning(true);
    }
  }, [aqiLevel, heartRate, oxygenLevel, hasShownHealthWarning]);
  
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
        
        <div className="mt-4 space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Your Health Metrics
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-xs text-muted-foreground">Heart Rate</div>
              <div className="mt-1 text-lg font-semibold">{heartRate} BPM</div>
            </div>
            
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-xs text-muted-foreground">Oxygen Level</div>
              <div className="mt-1 text-lg font-semibold">{oxygenLevel}%</div>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" /> 
            Last updated: {mockSmartWatchData.lastUpdated}
          </div>
          
          <Button 
            onClick={generateAIRecommendation}
            variant="outline" 
            className="w-full"
          >
            <Activity className="mr-2 h-4 w-4" />
            Get AI Health Recommendation
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthRecommendation;
