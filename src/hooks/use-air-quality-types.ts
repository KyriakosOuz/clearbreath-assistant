
export interface AirQualityData {
  aqi: number;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  time: string;
  source?: string;
  station?: string;
  pollutants: {
    [key: string]: number;
  };
  dominantPollutant?: string | null;
  attributions?: Array<{name: string, url: string}>;
  forecast?: {
    hourly: Array<{
      hour: string;
      aqi: number;
      time: string;
      components: {
        [key: string]: number;
      };
    }>;
  };
}

export interface AirQualityLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type DataSource = 'openweather' | 'iqair' | 'combined';
