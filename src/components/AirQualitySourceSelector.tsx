
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { DataSource } from "@/hooks/use-air-quality";

interface AirQualitySourceSelectorProps {
  source: DataSource;
  onChange: (source: DataSource) => void;
}

const AirQualitySourceSelector = ({ 
  source, 
  onChange 
}: AirQualitySourceSelectorProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-muted-foreground">Data Source:</span>
      <ToggleGroup 
        type="single" 
        value={source}
        onValueChange={(value) => value && onChange(value as DataSource)}
        size="sm"
        className="border rounded-md"
      >
        <ToggleGroupItem value="combined" className="text-xs px-2 py-1 h-7">
          Combined
        </ToggleGroupItem>
        <ToggleGroupItem value="openweather" className="text-xs px-2 py-1 h-7">
          OpenWeather
        </ToggleGroupItem>
        <ToggleGroupItem value="waqi" className="text-xs px-2 py-1 h-7">
          WAQI
        </ToggleGroupItem>
      </ToggleGroup>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Info className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">About Data Sources</h4>
            <p className="text-muted-foreground text-xs">
              <strong>Combined:</strong> Blends data from both sources, using WAQI's station measurements for current AQI and OpenWeather for forecasts.
            </p>
            <p className="text-muted-foreground text-xs">
              <strong>OpenWeather:</strong> Uses OpenWeather's air pollution API, which provides modeled data based on satellite observations and weather patterns.
            </p>
            <p className="text-muted-foreground text-xs">
              <strong>WAQI:</strong> Uses the World Air Quality Index Project data from physical monitoring stations, providing more localized measurements.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AirQualitySourceSelector;
