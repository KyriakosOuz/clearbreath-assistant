
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');
const WAQI_API_KEY = Deno.env.get('WAQI_API');

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
    const { origin, destination, transportMode } = await req.json();
    console.log(`Received request for route from ${origin} to ${destination} via ${transportMode}`);

    // Step 1: Get pollution data from the areas between origin and destination
    const pollutionData = await fetchAirQualityData(origin, destination);
    console.log("Pollution data retrieved:", pollutionData.length, "data points");

    // Step 2: Use Mistral AI to recommend the cleanest route
    const routeRecommendation = await getAIRouteRecommendation(
      origin, 
      destination, 
      transportMode, 
      pollutionData
    );
    console.log("AI generated route recommendation");

    return new Response(
      JSON.stringify({ 
        recommendation: routeRecommendation,
        pollutionData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in clean-route-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to fetch air quality data between two points
async function fetchAirQualityData(origin: string, destination: string) {
  // Determine bounding box between origin and destination
  const [originLat, originLng] = origin.split(',').map(Number);
  const [destLat, destLng] = destination.split(',').map(Number);
  
  const latMin = Math.min(originLat, destLat);
  const latMax = Math.max(originLat, destLat);
  const lngMin = Math.min(originLng, destLng);
  const lngMax = Math.max(originLng, destLng);
  
  // Add some buffer to the bounding box
  const buffer = 0.05; // approximately 5km
  const bounds = `${latMin - buffer},${lngMin - buffer},${latMax + buffer},${lngMax + buffer}`;
  
  // Use WAQI API to get air quality stations in the bounding box
  const url = `https://api.waqi.info/map/bounds/?token=${WAQI_API_KEY}&latlng=${bounds}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`WAQI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

// Function to generate route recommendation using Mistral AI
async function getAIRouteRecommendation(
  origin: string, 
  destination: string, 
  transportMode: string, 
  pollutionData: any[]
) {
  const [originLat, originLng] = origin.split(',').map(Number);
  const [destLat, destLng] = destination.split(',').map(Number);

  // Format pollution data for AI prompt
  const pollutionSummary = pollutionData.map(station => 
    `• Station "${station.station.name}": AQI ${station.aqi} (lat: ${station.lat}, lng: ${station.lon})`
  ).join("\n");

  // Create a detailed prompt for Mistral AI
  const prompt = `
As an AI route planner focused on air quality, analyze the following data:

ORIGIN: ${originLat}, ${originLng}
DESTINATION: ${destLat}, ${destLng}
TRANSPORT MODE: ${transportMode}

AIR QUALITY DATA (AQI values) in the region:
${pollutionSummary}

TASK:
1. Analyze the pollution data between these points
2. Identify areas with high pollution (AQI > 100)
3. Suggest a route that minimizes exposure to air pollution
4. If no clean route is possible, recommend the best time to travel or alternative transport

Based on this data, provide a detailed recommendation for the cleanest, healthiest route options. Consider trade-offs between route length and air quality exposure.

Format your answer as:
- Brief overview of air quality conditions
- 2-3 route options with reasoning
- Health recommendations for the journey
`;

  try {
    // Make API request to Mistral AI
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API error:", errorText);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Mistral AI:", error);
    return "Unable to generate AI route recommendation. Please try again later.";
  }
}
