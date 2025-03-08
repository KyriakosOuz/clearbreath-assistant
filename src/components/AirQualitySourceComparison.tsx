
import { AirQualityData } from '@/hooks/use-air-quality';

interface AirQualitySourceComparisonProps {
  openWeatherData: AirQualityData | null;
  iqairData: AirQualityData | null;
}

const AirQualitySourceComparison = ({ 
  openWeatherData, 
  iqairData 
}: AirQualitySourceComparisonProps) => {
  return (
    <div className="mt-4 pt-3 border-t border-muted">
      <h4 className="text-xs font-medium mb-2">Source comparison</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/20 p-2 text-center">
          <div className="text-xs text-muted-foreground">OpenWeather</div>
          <div className="font-medium text-sm">
            {openWeatherData ? openWeatherData.aqi : 'N/A'}
          </div>
        </div>
        <div className="rounded-lg bg-muted/20 p-2 text-center">
          <div className="text-xs text-muted-foreground">IQAir</div>
          <div className="font-medium text-sm">
            {iqairData ? iqairData.aqi : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualitySourceComparison;
