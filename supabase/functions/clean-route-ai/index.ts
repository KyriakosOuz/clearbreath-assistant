
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

// Create a helper function for error responses
const errorResponse = (message: string, status = 400) => {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    }
  );
};

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

interface PollutionPoint {
  lat: number;
  lon: number;
  aqi: number;
  station: {
    name: string;
  };
}

// Function to fetch WAQI air quality data
async function fetchAirQualityData(lat: number, lon: number) {
  try {
    const waqi_token = Deno.env.get('WAQI_API');
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqi_token}`
    );
    
    if (!response.ok) {
      throw new Error(`WAQI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`WAQI error: ${data.data}`);
    }
    
    return {
      aqi: data.data.aqi,
      station: data.data.city.name
    };
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return { aqi: 0, station: "Unknown" };
  }
}

// Function to get multiple air quality points near route
async function getPollutionDataAlongRoute(
  startLat: number, 
  startLon: number, 
  endLat: number, 
  endLon: number
): Promise<PollutionPoint[]> {
  const points: PollutionPoint[] = [];
  
  // Get AQI at starting point
  const startAqi = await fetchAirQualityData(startLat, startLon);
  points.push({
    lat: startLat,
    lon: startLon,
    aqi: startAqi.aqi,
    station: {
      name: startAqi.station
    }
  });
  
  // Get AQI at ending point
  const endAqi = await fetchAirQualityData(endLat, endLon);
  points.push({
    lat: endLat,
    lon: endLon,
    aqi: endAqi.aqi,
    station: {
      name: endAqi.station
    }
  });
  
  // Get a point in the middle
  const midLat = (startLat + endLat) / 2;
  const midLon = (startLon + endLon) / 2;
  const midAqi = await fetchAirQualityData(midLat, midLon);
  points.push({
    lat: midLat,
    lon: midLon,
    aqi: midAqi.aqi,
    station: {
      name: midAqi.station
    }
  });
  
  // Add a small offset to get a fourth point
  const offsetLat = midLat + 0.01;
  const offsetLon = midLon + 0.01;
  const offsetAqi = await fetchAirQualityData(offsetLat, offsetLon);
  points.push({
    lat: offsetLat,
    lon: offsetLon,
    aqi: offsetAqi.aqi,
    station: {
      name: offsetAqi.station
    }
  });
  
  return points;
}

async function getRouteRecommendation(
  pollutionData: PollutionPoint[],
  transportMode: string
): Promise<string> {
  // Check if we have high pollution levels
  const highPollutionPoints = pollutionData.filter(point => point.aqi > 100);
  const maxAqi = Math.max(...pollutionData.map(point => point.aqi));
  
  // Create a recommendation based on the pollution data
  let recommendation = "";
  
  if (highPollutionPoints.length > 0) {
    recommendation += `⚠️ **Air Quality Alert**: We detected ${highPollutionPoints.length} area(s) with unhealthy air quality (AQI > 100) along your route.\n\n`;
    
    recommendation += `The maximum AQI level on your route is ${maxAqi}, which is considered ${maxAqi > 150 ? 'Unhealthy' : maxAqi > 100 ? 'Unhealthy for Sensitive Groups' : 'Moderate'}.\n\n`;
    
    // Transport-specific recommendations
    if (transportMode === 'walking' || transportMode === 'bicycling') {
      recommendation += `🛑 **Health Recommendation**: Since you're planning to ${transportMode === 'walking' ? 'walk' : 'bike'}, consider wearing a mask or finding an alternative route with better air quality. Prolonged physical activity in polluted air can harm your respiratory system.\n\n`;
      
      recommendation += `⏱️ If possible, try to travel during times when pollution is typically lower (early morning or after rain).\n\n`;
      
      recommendation += `🔄 Alternative options to consider:\n- Use public transportation instead\n- Choose a route through parks or areas with more vegetation\n- Delay your trip if air quality is expected to improve later\n\n`;
    } else if (transportMode === 'driving') {
      recommendation += `🚗 **Driving Recommendations**: Keep windows closed and use recirculated air in your vehicle's ventilation system to reduce exposure to pollutants.\n\n`;
    } else if (transportMode === 'transit') {
      recommendation += `🚌 **Public Transit Recommendations**: Minimize waiting time at outdoor stations in highly polluted areas. Consider using stations that are underground or enclosed if available.\n\n`;
    }
    
    // Highlight problematic areas
    recommendation += `📍 **Areas with poor air quality**:\n`;
    highPollutionPoints.forEach(point => {
      recommendation += `- Near "${point.station.name}" (AQI: ${point.aqi})\n`;
    });
    
    recommendation += `\n🩺 **Health protection measures**:\n- Wear an N95 mask if available\n- Stay hydrated\n- Consider using a bronchodilator if you have asthma\n- Monitor for symptoms like coughing, wheezing, or shortness of breath\n`;
  } else {
    // Good air quality
    recommendation += `✅ **Good News**: The air quality along your route is generally good with a maximum AQI of ${maxAqi}.\n\n`;
    
    recommendation += `🚶 You can safely ${transportMode === 'walking' ? 'walk' : transportMode === 'bicycling' ? 'bike' : transportMode === 'driving' ? 'drive' : 'use public transit'} along this route without significant air quality concerns.\n\n`;
    
    recommendation += `📊 **Air Quality Details**:\n`;
    pollutionData.forEach(point => {
      recommendation += `- Near "${point.station.name}" (AQI: ${point.aqi} - ${point.aqi < 50 ? 'Good' : 'Moderate'})\n`;
    });
    
    recommendation += `\n💡 **Tips**: Even with good air quality, if you have respiratory conditions, it's always good practice to bring any prescribed medication with you when traveling.`;
  }
  
  return recommendation;
}

// The main handler for the clean-route-ai function
serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  // Verify method
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST.', 405);
  }
  
  // Get request body
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Missing or invalid request body');
  }
  
  const { origin, destination, transportMode } = body;
  
  if (!origin || !destination) {
    return errorResponse('Missing required parameters: origin, destination');
  }
  
  try {
    // Parse origin and destination coordinates
    const [originLat, originLng] = origin.split(',').map(parseFloat);
    const [destLat, destLng] = destination.split(',').map(parseFloat);
    
    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return errorResponse('Invalid coordinates format. Use lat,lng');
    }
    
    // Get pollution data along the route
    const pollutionData = await getPollutionDataAlongRoute(
      originLat, originLng, destLat, destLng
    );
    
    // Get AI recommendation for the route
    const recommendation = await getRouteRecommendation(
      pollutionData,
      transportMode || 'walking'
    );
    
    // Return response
    return new Response(
      JSON.stringify({
        pollutionData,
        recommendation
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return errorResponse(`Server error: ${error.message}`, 500);
  }
});
