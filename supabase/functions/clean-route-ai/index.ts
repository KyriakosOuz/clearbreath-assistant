
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

interface RouteRequest {
  origin: string;
  destination: string;
  transportMode: string;
}

serve(async (req) => {
  try {
    // Parse the request
    const { origin, destination, transportMode } = await req.json() as RouteRequest;
    
    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ error: "Origin and destination are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Generating route from ${origin} to ${destination} using ${transportMode}`);
    
    // Parse coordinates
    const originParts = origin.split(',').map(parseFloat);
    const destParts = destination.split(',').map(parseFloat);
    
    if (originParts.length !== 2 || destParts.length !== 2 || 
        isNaN(originParts[0]) || isNaN(originParts[1]) || 
        isNaN(destParts[0]) || isNaN(destParts[1])) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Generate a simple direct route between points
    const originPoint = { lat: originParts[0], lng: originParts[1] };
    const destPoint = { lat: destParts[0], lng: destParts[1] };
    
    // Create intermediate points to make the route more realistic
    const standardRoute = [
      originPoint,
      { 
        lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.33, 
        lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.33 
      },
      { 
        lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.66, 
        lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.66 
      },
      destPoint
    ];
    
    // Generate a "clean" route that diverts slightly from the standard route
    const cleanRoute = [
      originPoint,
      { 
        lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.25 + 0.005, 
        lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.25 - 0.003
      },
      { 
        lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.5 + 0.008, 
        lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.5 - 0.005 
      },
      { 
        lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.75 + 0.003, 
        lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.75 - 0.002
      },
      destPoint
    ];
    
    // Simulate pollution zones along the route
    const pollutionZones = [
      {
        center: { 
          lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.4, 
          lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.4 
        },
        radius: 300,
        value: 85,
        points: 12
      },
      {
        center: { 
          lat: originPoint.lat + (destPoint.lat - originPoint.lat) * 0.7, 
          lng: originPoint.lng + (destPoint.lng - originPoint.lng) * 0.7 
        },
        radius: 400,
        value: 65,
        points: 8
      }
    ];
    
    // Create a prediction in the database
    const routes = {
      standard: standardRoute,
      clean: cleanRoute,
      pollution_zones: pollutionZones
    };
    
    const { data: prediction, error: predictionError } = await supabase
      .from('pollution_predictions')
      .insert({
        dataset_id: null, // This route doesn't have a dataset
        predicted_pollution_zones: pollutionZones,
        generated_routes: routes,
        status: 'Completed'
      })
      .select()
      .single();
      
    if (predictionError) {
      console.error("Error creating prediction:", predictionError);
      return new Response(
        JSON.stringify({ error: "Failed to create prediction record" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Route generated successfully",
        prediction_id: prediction.id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
