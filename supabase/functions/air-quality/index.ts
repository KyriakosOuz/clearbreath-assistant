
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirQualityResponse {
  status: string;
  data: {
    aqi: number;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    time: string;
    pollutants: {
      [key: string]: number;
    };
    forecast?: {
      hourly: Array<{
        hour: string;
        aqi: number;
      }>;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the location from the request, or default to Thessaloniki
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat') || '40.6403';
    const lon = url.searchParams.get('lon') || '22.9439';
    
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!openWeatherApiKey) {
      console.error('Missing OpenWeatherMap API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching air quality data for coordinates: ${lat}, ${lon}`);
    
    // Call OpenWeatherMap Air Pollution API
    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;
    
    // Fetch both current and forecast data
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(apiUrl),
      fetch(forecastUrl)
    ]);
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch air quality data');
    }
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    
    // Get city name from reverse geocoding
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${openWeatherApiKey}`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();
    
    const cityName = geocodingData[0]?.name || 'Unknown Location';
    
    // Process the air quality data
    const currentAQI = currentData.list[0].main.aqi;
    const pollutants = {
      'PM2.5': currentData.list[0].components.pm2_5,
      'PM10': currentData.list[0].components.pm10,
      'O3': currentData.list[0].components.o3,
      'NO2': currentData.list[0].components.no2,
      'SO2': currentData.list[0].components.so2,
      'CO': currentData.list[0].components.co
    };
    
    // Process forecast data (next 24 hours, at 3-hour intervals)
    const hourlyForecast = forecastData.list
      .slice(0, 8)  // Get next 24 hours (8 entries at 3-hour intervals)
      .map((item: any) => {
        const date = new Date(item.dt * 1000);
        return {
          hour: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aqi: item.main.aqi,
          time: date.toISOString(),
          components: item.components
        };
      });
    
    // Format the response
    const response: AirQualityResponse = {
      status: 'success',
      data: {
        aqi: currentAQI,
        city: cityName,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        },
        time: new Date(currentData.list[0].dt * 1000).toISOString(),
        pollutants,
        forecast: {
          hourly: hourlyForecast
        }
      }
    };
    
    console.log('Successfully fetched air quality data');
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
