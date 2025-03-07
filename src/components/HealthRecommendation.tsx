
import { motion } from 'framer-motion';
import { Heart, Activity, User, Shield, Clock, Smartphone, BellRing, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { useHealthData } from '@/hooks/use-health-data';

type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous' | 'severe';

interface HealthRecommendationProps {
  aqiLevel: AirQualityLevel;
  className?: string;
  pollutants?: {
    [key: string]: number;
  };
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

const HealthRecommendation = ({ 
  aqiLevel, 
  className,
  pollutants = { 'PM2.5': 12, 'PM10': 24, 'O3': 68, 'NO2': 15 }
}: HealthRecommendationProps) => {
  const { general, sensitive, icon: Icon, color } = getRecommendations(aqiLevel);
  const { toast } = useToast();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // Get the numeric AQI value for the hook
  const getNumericAQI = (level: AirQualityLevel): number => {
    switch (level) {
      case 'good': return 30;
      case 'moderate': return 75;
      case 'unhealthy': return 125;
      case 'hazardous': return 200;
      case 'severe': return 300;
      default: return 50;
    }
  };
  
  const {
    healthData,
    recommendation,
    isLoading,
    connectDevice,
    disconnectDevice,
    updateHealthData,
    getRecommendation
  } = useHealthData(getNumericAQI(aqiLevel), pollutants);
  
  // Format the time for display
  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Unknown';
    }
  };
  
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
            {healthData.connected ? (
              <span className="ml-auto text-xs flex items-center text-green-600">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Connected to {healthData.deviceType}
              </span>
            ) : (
              <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Connect Device
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect to a Health Device</DialogTitle>
                    <DialogDescription>
                      Select a smartwatch or health tracking device to connect with.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button onClick={() => { connectDevice('GoogleFit'); setIsConnectModalOpen(false); }}>
                      Connect to Google Fit (Wear OS)
                    </Button>
                    <Button onClick={() => { connectDevice('HuaweiHealth'); setIsConnectModalOpen(false); }}>
                      Connect to Huawei Health Kit
                    </Button>
                    <Button onClick={() => { connectDevice('AppleHealth'); setIsConnectModalOpen(false); }}>
                      Connect to Apple Health
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "rounded-lg p-3",
              healthData.heartRate > 100 ? "bg-red-50" : "bg-blue-50"
            )}>
              <div className="text-xs text-muted-foreground">Heart Rate</div>
              <div className="mt-1 text-lg font-semibold">
                {healthData.heartRate} 
                <span className="text-sm font-normal ml-1">BPM</span>
              </div>
            </div>
            
            <div className={cn(
              "rounded-lg p-3",
              healthData.oxygenLevel < 95 ? "bg-red-50" : "bg-blue-50"
            )}>
              <div className="text-xs text-muted-foreground">Oxygen Level</div>
              <div className="mt-1 text-lg font-semibold">{healthData.oxygenLevel}%</div>
            </div>
          </div>
          
          {healthData.connected && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="text-xs text-muted-foreground">Steps Today</div>
                <div className="mt-1 text-lg font-semibold">
                  {healthData.steps?.toLocaleString() || 0}
                </div>
              </div>
              
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="text-xs text-muted-foreground">Stress Level</div>
                <div className="mt-1 text-lg font-semibold">
                  {healthData.stressLevel || 0}
                  <span className="text-sm font-normal ml-1">/10</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              <Clock className="mr-1 inline-block h-3 w-3" /> 
              Updated: {formatTime(healthData.lastUpdated)}
            </div>
            {healthData.connected && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={disconnectDevice}
              >
                <XCircle className="h-3 w-3 mr-1" /> Disconnect
              </Button>
            )}
          </div>
          
          {recommendation && (
            <div className={cn(
              "mt-2 rounded-lg p-3 text-sm",
              recommendation.isEmergency ? "bg-red-100 text-red-800" : "bg-blue-50 text-blue-800"
            )}>
              {recommendation.isEmergency && (
                <div className="flex items-center mb-1 text-red-600 font-semibold">
                  <BellRing className="h-4 w-4 mr-1 animate-pulse" />
                  ALERT
                </div>
              )}
              <p>{recommendation.text}</p>
            </div>
          )}
          
          <Button 
            onClick={getRecommendation}
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Get AI Health Recommendation
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthRecommendation;
