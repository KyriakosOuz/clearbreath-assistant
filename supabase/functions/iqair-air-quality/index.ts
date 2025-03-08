
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
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
    
    const iqairApiKey = Deno.env.get('IQAIR_API_KEY');
    
    if (!iqairApiKey) {
      console.error('Missing IQAir API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching IQAir air quality data for coordinates: ${lat}, ${lon}`);
    
    // Call IQAir API for air quality data
    const apiUrl = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${iqairApiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IQAir air quality data: ${response.status}`);
    }
    
    const rawData = await response.json();
    
    if (rawData.status !== 'success') {
      throw new Error(`IQAir API error: ${rawData.data}`);
    }
    
    // Process the IQAir data to match our application's format
    const data = rawData.data;
    const aqi = data.current.pollution.aqius;
    const processedData = {
      status: 'success',
      data: {
        aqi: aqi,
        city: `${data.city}, ${data.country}`,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        },
        time: new Date().toISOString(),
        station: data.city,
        pollutants: {
          'PM2.5': data.current.pollution.mainus === 'p2' ? data.current.pollution.aqius : 0,
          'PM10': data.current.pollution.mainus === 'p1' ? data.current.pollution.aqius : 0
        },
        dominantPollutant: data.current.pollution.mainus === 'p2' ? 'PM2.5' : 'PM10',
        attributions: [
          {
            name: "IQAir",
            url: "https://www.iqair.com/"
          }
        ]
      }
    };
    
    console.log('Successfully fetched IQAir air quality data');
    
    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching IQAir air quality data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
