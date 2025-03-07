
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
    
    const waqiApiKey = Deno.env.get('WAQI_API_KEY') || 'demo';
    
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
      throw new Error(`Failed to fetch WAQI air quality data: ${response.status}`);
    }
    
    const rawData = await response.json();
    
    // Process the WAQI data to match our application's format
    const processedData = {
      status: 'success',
      data: rawData.data
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
