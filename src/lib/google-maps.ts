
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = "AIzaSyDRE_a17kZ0tNhZ4Z14dYVU22KX5Hci_DU";

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
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
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
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
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
