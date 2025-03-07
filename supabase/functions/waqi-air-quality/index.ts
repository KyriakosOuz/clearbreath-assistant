
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the location from the request body, or default to Thessaloniki
    let lat = '40.6403';
    let lon = '22.9439';
    
    // Parse the request body to get lat/lon values
    const requestData = await req.json().catch(() => ({}));
    if (requestData && requestData.lat) {
      lat = requestData.lat;
    }
    if (requestData && requestData.lon) {
      lon = requestData.lon;
    }
    
    const waqiApiKey = Deno.env.get('WAQI_API_KEY');
    
    if (!waqiApiKey) {
      console.error('Missing WAQI API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching WAQI air quality data for coordinates: ${lat}, ${lon}`);
    
    // Call WAQI API for the nearest station data
    const apiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiApiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch WAQI air quality data');
    }
    
    const rawData = await response.json();
    
    // Process the WAQI data to match our application's format
    const processedData = {
      status: 'success',
      data: {
        aqi: rawData.data.aqi,
        city: rawData.data.city.name,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        },
        time: rawData.data.time.iso,
        source: "WAQI",
        station: rawData.data.city.name,
        pollutants: {
          'PM2.5': rawData.data.iaqi.pm25?.v || 0,
          'PM10': rawData.data.iaqi.pm10?.v || 0,
          'O3': rawData.data.iaqi.o3?.v || 0,
          'NO2': rawData.data.iaqi.no2?.v || 0,
          'SO2': rawData.data.iaqi.so2?.v || 0,
          'CO': rawData.data.iaqi.co?.v || 0
        },
        dominantPollutant: rawData.data.dominentpol || null,
        attributions: rawData.data.attributions || [],
        forecast: rawData.data.forecast?.daily || null
      }
    };
    
    console.log('Successfully fetched WAQI air quality data');
    
    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching WAQI air quality data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
