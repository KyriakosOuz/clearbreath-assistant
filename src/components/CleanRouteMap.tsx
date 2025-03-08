
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map, MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { PollutionPrediction, PollutionZone, RoutePoint } from '@/types/dataset';

interface CleanRouteMapProps {
  width?: string;
  height?: string;
  className?: string;
}

// Initialize Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function CleanRouteMap({ width = '100%', height = '600px', className = '' }: CleanRouteMapProps) {
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('predictionId');
  
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState<PollutionPrediction | null>(null);
  const [routeType, setRouteType] = useState<'standard' | 'clean'>('clean');
  const [routeRenderer, setRouteRenderer] = useState<any>(null);
  const [pollutionCircles, setPollutionCircles] = useState<any[]>([]);
  
  // Load the prediction data
  useEffect(() => {
    const loadPrediction = async () => {
      if (!predictionId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('pollution_predictions')
          .select('*')
          .eq('id', predictionId)
          .single();
          
        if (error) {
          console.error('Error loading prediction:', error);
          toast.error('Error loading prediction data');
          return;
        }
        
        // Transform the data into the right shape
        if (data) {
          const parsedPollutionZones = Array.isArray(data.predicted_pollution_zones) 
            ? data.predicted_pollution_zones 
            : [];
            
          const parsedRoutes = typeof data.generated_routes === 'object' && data.generated_routes !== null
            ? data.generated_routes
            : { standard: [], clean: [], pollution_zones: [] };
          
          const formattedPrediction: PollutionPrediction = {
            id: data.id,
            dataset_id: data.dataset_id,
            predicted_pollution_zones: parsedPollutionZones as unknown as PollutionZone[],
            generated_routes: parsedRoutes as unknown as {
              standard: RoutePoint[];
              clean: RoutePoint[];
              pollution_zones: PollutionZone[];
            },
            status: data.status as PollutionPrediction['status'],
            created_at: data.created_at
          };
          
          setPrediction(formattedPrediction);
        }
      } catch (error) {
        console.error('Error loading prediction:', error);
        toast.error('Failed to load prediction data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrediction();
  }, [predictionId]);
  
  // Initialize the map
  const initializeMap = useCallback(() => {
    if (!window.google || !prediction || !prediction.generated_routes) return;
    
    // Get route data
    const routes = prediction.generated_routes;
    
    // Calculate map bounds
    const bounds = new window.google.maps.LatLngBounds();
    
    // Add all points to bounds
    [...routes.standard, ...routes.clean].forEach(point => {
      bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
    });
    
    // Create the map
    const mapInstance = new window.google.maps.Map(document.getElementById('clean-route-map'), {
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
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: routeType === 'clean' ? '#34d399' : '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
    });
    
    directionsRenderer.setMap(mapInstance);
    setRouteRenderer(directionsRenderer);
    
    // Draw pollution zones as circles
    const circles: any[] = [];
    if (routes.pollution_zones) {
      routes.pollution_zones.forEach((zone: PollutionZone) => {
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
          map: mapInstance,
          center: zone.center,
          radius: zone.radius,
        });
        
        circles.push(circle);
      });
    }
    
    setPollutionCircles(circles);
    setMap(mapInstance);
    
    // Fit map to bounds
    mapInstance.fitBounds(bounds);
    
  }, [prediction, routeType]);
  
  // Draw the route
  const drawRoute = useCallback(() => {
    if (!map || !routeRenderer || !prediction || !prediction.generated_routes) return;
    
    const routes = prediction.generated_routes;
    const routePoints = routeType === 'clean' ? routes.clean : routes.standard;
    
    if (!routePoints || routePoints.length < 2) {
      toast.error('No route points available');
      return;
    }
    
    // Update route renderer style
    routeRenderer.setOptions({
      polylineOptions: {
        strokeColor: routeType === 'clean' ? '#34d399' : '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
    });
    
    // Create a path from route points
    const path = routePoints.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));
    
    // Create a DirectionsService
    const directionsService = new window.google.maps.DirectionsService();
    
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
          strokeColor: routeType === 'clean' ? '#34d399' : '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 6,
        });
        
        routeRenderer.setMap(null);
        polyline.setMap(map);
      }
    });
    
  }, [map, routeRenderer, prediction, routeType]);
  
  // Load the Google Maps API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }
    
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading route data...</p>
        </div>
      </div>
    );
  }
  
  if (!predictionId) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Prediction Selected</CardTitle>
            <CardDescription>
              Please select a prediction from your datasets to view the clean route.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/datasets'}>
              <Map className="mr-2 h-4 w-4" />
              Go to Datasets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!prediction || !prediction.generated_routes) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Prediction Not Found</CardTitle>
            <CardDescription>
              The selected prediction does not exist or does not contain any route data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/datasets'}>
              <Map className="mr-2 h-4 w-4" />
              Go to Datasets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 right-4 z-10 space-y-4">
        <Card className="w-64">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Route Options</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Select value={routeType} onValueChange={(value) => setRouteType(value as 'standard' | 'clean')}>
              <SelectTrigger>
                <SelectValue placeholder="Select route type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    Standard Route
                  </div>
                </SelectItem>
                <SelectItem value="clean">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    Clean Air Route
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <Badge className="mb-2">Legend</Badge>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <span>High Pollution</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Medium Pollution</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Low Pollution</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div 
        id="clean-route-map" 
        className="rounded-lg border overflow-hidden" 
        style={{ width, height }}
      ></div>
    </div>
  );
}
