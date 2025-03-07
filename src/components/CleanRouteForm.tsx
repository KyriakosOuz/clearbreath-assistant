
import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, AlertTriangle, Save, Bookmark, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { geocodeAddress } from '@/lib/google-maps';
import { useUser } from '@clerk/clerk-react';
import { useSavedRoutes, SavedRoute } from '@/hooks/use-saved-routes';

interface CleanRouteFormProps {
  onRouteSelected: (origin: string, destination: string, transportMode: string) => void;
  isLoading: boolean;
}

const CleanRouteForm = ({ onRouteSelected, isLoading }: CleanRouteFormProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('walking');
  const [showDemo, setShowDemo] = useState(false);
  const [useCoordinates, setUseCoordinates] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  
  const { isSignedIn } = useUser();
  const { routes, saveRoute, deleteRoute, toggleFavorite, isLoading: isLoadingRoutes } = useSavedRoutes();
  
  // Store the current route for saving
  const [currentRoute, setCurrentRoute] = useState<{
    origin: string;
    destination: string;
    transportMode: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination) {
      toast.error('Please enter both origin and destination');
      return;
    }

    if (!useCoordinates) {
      // Convert addresses to coordinates
      toast.loading('Converting addresses to coordinates...');
      
      const originCoords = await geocodeAddress(origin);
      const destCoords = await geocodeAddress(destination);
      
      if (!originCoords || !destCoords) {
        toast.error('Could not geocode one or both locations');
        return;
      }
      
      const originString = `${originCoords[0]},${originCoords[1]}`;
      const destString = `${destCoords[0]},${destCoords[1]}`;
      
      setCurrentRoute({
        origin: originString,
        destination: destString,
        transportMode
      });
      
      onRouteSelected(originString, destString, transportMode);
    } else {
      // Use coordinates directly
      setCurrentRoute({
        origin,
        destination,
        transportMode
      });
      
      onRouteSelected(origin, destination, transportMode);
    }
  };

  const handleDemoRoute = () => {
    // Use predefined coordinates for a demo route (San Francisco)
    setOrigin('37.7749,-122.4194');
    setDestination('37.7833,-122.4324');
    setUseCoordinates(true);
    setShowDemo(true);
  };
  
  const handleSaveRoute = async () => {
    if (!currentRoute) {
      toast.error('No route selected to save');
      return;
    }
    
    if (!routeName.trim()) {
      toast.error('Please enter a name for this route');
      return;
    }
    
    await saveRoute({
      name: routeName,
      origin: currentRoute.origin,
      destination: currentRoute.destination,
      transport_mode: currentRoute.transportMode
    });
    
    setSaveDialogOpen(false);
    setRouteName('');
  };
  
  const handleSelectSavedRoute = (route: SavedRoute) => {
    setOrigin(route.origin);
    setDestination(route.destination);
    setTransportMode(route.transport_mode);
    setUseCoordinates(true);
    
    onRouteSelected(route.origin, route.destination, route.transport_mode);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="mr-2 h-5 w-5" /> 
          Clean Route Planner
        </CardTitle>
        <CardDescription>
          Find routes with the cleanest air to protect your health
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="saved" disabled={!isSignedIn}>
              <Bookmark className="mr-2 h-4 w-4" />
              Saved Routes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Input Type</Label>
                  <Select
                    value={useCoordinates ? "coordinates" : "address"}
                    onValueChange={(v) => setUseCoordinates(v === "coordinates")}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="coordinates">Coordinates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <label htmlFor="origin" className="text-sm font-medium">
                    {useCoordinates ? "Starting Point (lat,lng)" : "Starting Address"}
                  </label>
                </div>
                <Input
                  id="origin"
                  placeholder={useCoordinates ? "Enter coordinates (lat,lng)" : "Enter address"}
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <label htmlFor="destination" className="text-sm font-medium">
                    {useCoordinates ? "Destination (lat,lng)" : "Destination Address"}
                  </label>
                </div>
                <Input
                  id="destination"
                  placeholder={useCoordinates ? "Enter coordinates (lat,lng)" : "Enter address"}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="transportMode" className="text-sm font-medium">Mode of Transport</label>
                <Select
                  value={transportMode}
                  onValueChange={(value) => setTransportMode(value)}
                >
                  <SelectTrigger id="transportMode">
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="bicycling">Bicycling</SelectItem>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="transit">Public Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-4 rounded-full mr-2" />
                      Finding Cleanest Route...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find Clean Route
                    </>
                  )}
                </Button>

                {!showDemo && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDemoRoute}
                  >
                    Use Demo Route
                  </Button>
                )}
                
                {currentRoute && isSignedIn && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full" 
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save This Route
                  </Button>
                )}
              </div>
            </form>

            {useCoordinates && (
              <Alert className="mt-4 bg-amber-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Coordinate Format</AlertTitle>
                <AlertDescription>
                  Please enter coordinates in the format: latitude,longitude (e.g., 37.7749,-122.4194)
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="saved">
            {isLoadingRoutes ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : routes.length > 0 ? (
              <div className="space-y-2">
                {routes.map((route) => (
                  <div 
                    key={route.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectSavedRoute(route)}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${route.transport_mode === 'walking' 
                        ? 'bg-green-100' 
                        : route.transport_mode === 'bicycling' 
                        ? 'bg-blue-100' 
                        : route.transport_mode === 'transit' 
                        ? 'bg-purple-100'
                        : 'bg-gray-100'}`}
                      >
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{route.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {route.transport_mode.charAt(0).toUpperCase() + route.transport_mode.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(route.id, !route.is_favorite);
                        }}
                      >
                        <Star className={`h-4 w-4 ${route.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoute(route.id);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>You don't have any saved routes yet</p>
                <p className="text-sm">Search for a route and save it to see it here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Route</DialogTitle>
              <DialogDescription>
                Give this route a name to save it to your account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="route-name">Route Name</Label>
                <Input
                  id="route-name"
                  placeholder="Home to Work"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRoute}>
                Save Route
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CleanRouteForm;
