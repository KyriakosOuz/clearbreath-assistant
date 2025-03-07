
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import { useAirQuality } from '@/hooks/use-air-quality';
import AnimatedBackground from '@/components/AnimatedBackground';
import AirQualityWidget from '@/components/AirQualityWidget';
import AirQualityForecast from '@/components/AirQualityForecast';
import AirQualityMap from '@/components/AirQualityMap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const defaultLocations: SavedLocation[] = [
  { id: '1', name: 'Thessaloniki', latitude: 40.6403, longitude: 22.9439 },
  { id: '2', name: 'Athens', latitude: 37.9838, longitude: 23.7275 },
];

const AirQualityPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation>(defaultLocations[0]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(defaultLocations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationLat, setNewLocationLat] = useState('');
  const [newLocationLon, setNewLocationLon] = useState('');
  
  const { refetch } = useAirQuality({
    lat: selectedLocation.latitude,
    lon: selectedLocation.longitude
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAddLocation = () => {
    if (!newLocationName || !newLocationLat || !newLocationLon) return;
    
    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name: newLocationName,
      latitude: parseFloat(newLocationLat),
      longitude: parseFloat(newLocationLon)
    };
    
    setSavedLocations([...savedLocations, newLocation]);
    setNewLocationName('');
    setNewLocationLat('');
    setNewLocationLon('');
  };
  
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold"
          >
            Real-Time Air Quality
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input 
                      id="name" 
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="e.g., Home, Office, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input 
                        id="latitude" 
                        value={newLocationLat}
                        onChange={(e) => setNewLocationLat(e.target.value)}
                        placeholder="e.g., 40.6403"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input 
                        id="longitude" 
                        value={newLocationLon}
                        onChange={(e) => setNewLocationLon(e.target.value)}
                        placeholder="e.g., 22.9439"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddLocation} className="w-full">Add Location</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </motion.div>
        </div>
        
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {savedLocations.map((location) => (
              <Button
                key={location.id}
                variant={selectedLocation.id === location.id ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={() => setSelectedLocation(location)}
              >
                <MapPin className="h-3 w-3" />
                {location.name}
              </Button>
            ))}
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-1"
            >
              <AirQualityWidget 
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                className="h-full"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="md:col-span-2"
            >
              <AirQualityForecast className="h-full" />
            </motion.div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Air Quality Map</h2>
          <div className="h-[500px]">
            <AirQualityMap className="h-full w-full" />
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default AirQualityPage;
