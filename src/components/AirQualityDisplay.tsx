
import { Badge } from '@/components/ui/badge';
import { Database, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AirQualityDisplayProps {
  aqi: number;
  level: string;
  levelText: string;
  source?: string;
  station?: string;
  dominantPollutant?: string;
  pollutants?: Record<string, number>;
  formattedTime?: string;
}

const AirQualityDisplay = ({
  aqi,
  level,
  levelText,
  source,
  station,
  dominantPollutant,
  pollutants,
  formattedTime
}: AirQualityDisplayProps) => {
  return (
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
        
        {source && (
          <Badge variant="outline" className="mt-1 text-[10px]">
            <Database className="h-2.5 w-2.5 mr-1" />
            {source}
          </Badge>
        )}
        
        {station && (
          <span className="mt-1 text-[10px] text-muted-foreground">
            Station: {station}
          </span>
        )}
      </div>
      
      {pollutants && Object.keys(pollutants).length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(pollutants).slice(0, 3).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-muted/20 p-2 text-center">
              <div className="text-xs text-muted-foreground">{key}</div>
              <div className="font-medium">{Math.round(value * 10) / 10}</div>
            </div>
          ))}
        </div>
      )}
      
      {dominantPollutant && (
        <div className="mt-3 text-xs text-center">
          <span className="text-muted-foreground">Dominant pollutant: </span>
          <span className="font-medium">{dominantPollutant}</span>
        </div>
      )}
      
      {formattedTime && (
        <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span>Updated at {formattedTime}</span>
        </div>
      )}
    </>
  );
};

export default AirQualityDisplay;
