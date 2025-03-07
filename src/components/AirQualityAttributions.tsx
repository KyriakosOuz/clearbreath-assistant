
import { ExternalLink } from "lucide-react";

interface AirQualityAttributionsProps {
  attributions?: Array<{
    name: string;
    url: string;
  }>;
  className?: string;
}

const AirQualityAttributions = ({ attributions, className }: AirQualityAttributionsProps) => {
  if (!attributions || attributions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h4 className="text-xs font-medium mb-1">Data attribution</h4>
      <ul className="text-xs text-muted-foreground">
        {attributions.map((attribution, index) => (
          <li key={index} className="inline-block mr-3">
            <a 
              href={attribution.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:underline"
            >
              <span>{attribution.name}</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AirQualityAttributions;
