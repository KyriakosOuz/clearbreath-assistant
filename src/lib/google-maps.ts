
import { toast } from "sonner";

// We'll fall back to a default API key if the environment variable is not set
// This should be replaced with a proper API key from Supabase Edge Function in a production environment
const FALLBACK_API_KEY = "AIzaSyDRE_a17kZ0tNhZ4Z14dYVU22KX5Hci_DU";

// Function to get the Google Maps API key from Supabase
const getGoogleMapsApiKey = async (): Promise<string> => {
  try {
    const supabaseUrl = 'https://uugdlxzevfyodglfrxdb.supabase.co';
    const response = await fetch(`${supabaseUrl}/functions/v1/maps-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Z2RseHpldmZ5b2RnbGZyeGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzMjEyODUsImV4cCI6MjA1NDg5NzI4NX0.zUGXkMKIrPa4_5hBXzg2WcQA8t8dHvM4rO4ZpyDJaSQ'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Google Maps API key: ${response.status}`);
    }
    
    const data = await response.json();
    return data.key;
  } catch (error) {
    console.error("Error fetching Google Maps API key:", error);
    return FALLBACK_API_KEY;
  }
};

// Cache the API key once we've retrieved it
let cachedApiKey: string | null = null;

interface GeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        html_instructions: string;
        polyline: { points: string };
        travel_mode: string;
      }>;
    }>;
    overview_polyline: { points: string };
  }>;
}

export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    // Get the API key if we don't have it yet
    if (!cachedApiKey) {
      cachedApiKey = await getGoogleMapsApiKey();
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${cachedApiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      toast.error(`Geocoding error: ${data.status}`);
      return null;
    }
    
    const result = data.results[0] as GeocodingResult;
    return [result.geometry.location.lat, result.geometry.location.lng];
  } catch (error) {
    console.error("Geocoding error:", error);
    toast.error("Failed to geocode address");
    return null;
  }
};

export const getDirections = async (
  origin: string,
  destination: string,
  mode: string = "walking"
): Promise<DirectionsResult | null> => {
  try {
    // Get the API key if we don't have it yet
    if (!cachedApiKey) {
      cachedApiKey = await getGoogleMapsApiKey();
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&mode=${mode}&key=${cachedApiKey}`
    );
    
    const data = await response.json();
    
    if (data.status !== "OK") {
      toast.error(`Directions error: ${data.status}`);
      return null;
    }
    
    return data as DirectionsResult;
  } catch (error) {
    console.error("Directions error:", error);
    toast.error("Failed to get directions");
    return null;
  }
};

export const decodePolyline = (encoded: string): [number, number][] => {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    points.push([lat / 1e5, lng / 1e5]);
  }
  
  return points;
};
