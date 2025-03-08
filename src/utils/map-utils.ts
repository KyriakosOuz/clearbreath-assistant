import { toast } from 'sonner';
import { PollutionZone, RoutePoint } from '@/types/dataset';

// Initialize Google Maps globally
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Create a DirectionsRenderer with specified color
export function createRouteRenderer(map: any, color: string) {
  return new window.google.maps.DirectionsRenderer({
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 6,
    },
    map,
  });
}

// Draw pollution zones as circles on the map
export function drawPollutionZones(map: any, zones: PollutionZone[]) {
  const circles: any[] = [];
  
  if (!zones) return circles;
  
  zones.forEach((zone: PollutionZone) => {
    // Normalize value to a color scale (red = high pollution, green = low)
    const normalizedValue = Math.min(1, Math.max(0, zone.value / 100));
    const r = Math.floor(255 * normalizedValue);
    const g = Math.floor(255 * (1 - normalizedValue));
    const b = 0;
    
    const circle = new window.google.maps.Circle({
      strokeColor: `rgb(${r}, ${g}, ${b})`,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: `rgb(${r}, ${g}, ${b})`,
      fillOpacity: 0.35,
      map: map,
      center: zone.center,
      radius: zone.radius,
    });
    
    circles.push(circle);
  });
  
  return circles;
}

// Calculate map bounds from route points
export function calculateMapBounds(points: RoutePoint[]) {
  const bounds = new window.google.maps.LatLngBounds();
  
  points.forEach(point => {
    bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
  });
  
  return bounds;
}

// Draw a route on the map using DirectionsService
export function drawRouteOnMap(
  directionsService: any,
  routeRenderer: any,
  routePoints: RoutePoint[],
  map: any
) {
  if (!routePoints || routePoints.length < 2) {
    toast.error('No route points available');
    return;
  }
  
  // Create a path from route points
  const path = routePoints.map(point => ({
    lat: point.lat,
    lng: point.lng
  }));
  
  // Create waypoints from the middle points
  const waypoints = path.slice(1, path.length - 1).map(point => ({
    location: new window.google.maps.LatLng(point.lat, point.lng),
    stopover: false
  }));
  
  // Make a directions request
  directionsService.route({
    origin: new window.google.maps.LatLng(path[0].lat, path[0].lng),
    destination: new window.google.maps.LatLng(path[path.length - 1].lat, path[path.length - 1].lng),
    waypoints: waypoints,
    optimizeWaypoints: false,
    travelMode: window.google.maps.TravelMode.WALKING,
  }, (result: any, status: any) => {
    if (status === window.google.maps.DirectionsStatus.OK) {
      routeRenderer.setDirections(result);
    } else {
      console.error('Directions request failed due to', status);
      
      // Fallback to a simple polyline if directions service fails
      const polyline = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: routeRenderer.polylineOptions.strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 6,
      });
      
      routeRenderer.setMap(null);
      polyline.setMap(map);
    }
  });
}
