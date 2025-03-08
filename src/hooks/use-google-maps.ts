
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { PollutionPrediction, RoutePoint } from '@/types/dataset';
import { calculateMapBounds, createRouteRenderer, drawPollutionZones, drawRouteOnMap } from '@/utils/map-utils';

export function useGoogleMaps(
  mapElementId: string,
  prediction: PollutionPrediction | null,
  routeType: 'standard' | 'clean'
) {
  const [map, setMap] = useState<any>(null);
  const [routeRenderer, setRouteRenderer] = useState<any>(null);
  const [pollutionCircles, setPollutionCircles] = useState<any[]>([]);
  const googleMapsLoaded = useRef(false);
  
  // Initialize the map
  const initializeMap = useCallback(() => {
    if (!window.google || !prediction || !prediction.generated_routes) return;
    
    // Get route data
    const routes = prediction.generated_routes;
    
    // Calculate map bounds from all route points
    const allPoints = [...routes.standard, ...routes.clean];
    const bounds = calculateMapBounds(allPoints);
    
    // Create the map
    const mapInstance = new window.google.maps.Map(document.getElementById(mapElementId), {
      center: bounds.getCenter(),
      zoom: 12,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
      },
      fullscreenControl: true,
    });
    
    // Create a DirectionsRenderer
    const renderer = createRouteRenderer(
      mapInstance, 
      routeType === 'clean' ? '#34d399' : '#3b82f6'
    );
    
    setRouteRenderer(renderer);
    
    // Draw pollution zones as circles
    const circles = drawPollutionZones(mapInstance, routes.pollution_zones);
    setPollutionCircles(circles);
    
    setMap(mapInstance);
    
    // Fit map to bounds
    mapInstance.fitBounds(bounds);
    
  }, [prediction, routeType, mapElementId]);
  
  // Draw the route
  const drawRoute = useCallback(() => {
    if (!map || !routeRenderer || !prediction || !prediction.generated_routes) return;
    
    const routes = prediction.generated_routes;
    const routePoints = routeType === 'clean' ? routes.clean : routes.standard;
    
    // Update route renderer style
    routeRenderer.setOptions({
      polylineOptions: {
        strokeColor: routeType === 'clean' ? '#34d399' : '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
    });
    
    // Create a DirectionsService
    const directionsService = new window.google.maps.DirectionsService();
    
    // Draw the route on the map
    drawRouteOnMap(directionsService, routeRenderer, routePoints, map);
    
  }, [map, routeRenderer, prediction, routeType]);
  
  // Load the Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }
    
    if (googleMapsLoaded.current) return;
    googleMapsLoaded.current = true;
    
    // Load Google Maps
    window.initMap = () => {
      initializeMap();
    };
    
    // Create script to load Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA2cs2VZ8QcKK5_j0U_a-2xp_5e14J7Bgw&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    return () => {
      window.initMap = () => {};
      // Remove the script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [initializeMap]);
  
  // Draw route when route type changes
  useEffect(() => {
    drawRoute();
  }, [drawRoute, routeType]);
  
  return { map };
}
