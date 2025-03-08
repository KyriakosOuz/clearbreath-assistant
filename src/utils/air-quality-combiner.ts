
import { AirQualityData } from '@/hooks/use-air-quality-types';

export const combineAirQualityData = (
  openWeatherData: AirQualityData | null, 
  iqairData: AirQualityData | null
): AirQualityData | null => {
  if (!openWeatherData && !iqairData) return null;
  
  // If we only have one data source, use that
  if (!openWeatherData) return iqairData;
  if (!iqairData) return openWeatherData;
  
  // Combine data, giving preference to IQAir for AQI as it's from stations
  // And using OpenWeather for forecast and other details
  const combined: AirQualityData = {
    aqi: iqairData.aqi, // Prefer IQAir for current AQI
    city: iqairData.city || openWeatherData.city,
    coordinates: iqairData.coordinates || openWeatherData.coordinates,
    time: new Date().toISOString(), // Use current time for combined data
    source: 'Combined (IQAir + OpenWeather)',
    station: iqairData.station,
    // Combine pollutants, prefer IQAir values when available
    pollutants: {
      ...openWeatherData.pollutants,
      ...iqairData.pollutants
    },
    dominantPollutant: iqairData.dominantPollutant,
    attributions: iqairData.attributions,
    // Use OpenWeather for forecast as it's more reliable for predictions
    forecast: openWeatherData.forecast
  };
  
  return combined;
};
