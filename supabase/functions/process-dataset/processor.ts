
// Dataset processing logic

interface Point {
  lat: number;
  lng: number;
  value: number;
  timestamp: string;
}

interface PollutionZone {
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  value: number;
  points: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

interface ProcessedResults {
  pollutionZones: PollutionZone[];
  routes: {
    standard: RoutePoint[];
    clean: RoutePoint[];
    pollution_zones: PollutionZone[];
  };
  summary: {
    total_points: number;
    pollution_zones: number;
  };
}

// Simple ML-like processing function (in a real scenario, this would use actual ML libraries)
export function processDataset(data: any[]): ProcessedResults {
  console.log("Processing dataset with", data.length, "rows");
  
  // Extract location data if available
  const locations: Point[] = data
    .filter(row => row.latitude && row.longitude && row.pollutant_value)
    .map(row => ({
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      value: parseFloat(row.pollutant_value),
      timestamp: row.timestamp || new Date().toISOString(),
    }));

  // Group pollution data by similar locations (simple clustering)
  const pollutionZones: PollutionZone[] = [];
  const processedLocations = new Set();

  // Simple clustering algorithm
  locations.forEach((loc) => {
    const locKey = `${loc.lat.toFixed(3)},${loc.lng.toFixed(3)}`;
    if (processedLocations.has(locKey)) return;
    
    processedLocations.add(locKey);
    
    // Find nearby points (within ~300 meters)
    const nearbyPoints = locations.filter(
      other => 
        Math.abs(other.lat - loc.lat) < 0.003 && 
        Math.abs(other.lng - loc.lng) < 0.003
    );
    
    if (nearbyPoints.length > 0) {
      // Calculate average pollution value
      const avgValue = nearbyPoints.reduce((sum, pt) => sum + pt.value, 0) / nearbyPoints.length;
      
      pollutionZones.push({
        center: { lat: loc.lat, lng: loc.lng },
        radius: 300, // meters
        value: avgValue,
        points: nearbyPoints.length,
      });
    }
  });
  
  // Generate routes
  const routes = generateRoutes(locations, pollutionZones);
  
  return {
    pollutionZones,
    routes,
    summary: {
      total_points: locations.length,
      pollution_zones: pollutionZones.length,
    }
  };
}

// Generate sample routes
function generateRoutes(locations: Point[], pollutionZones: PollutionZone[]) {
  // Get min and max coordinates to establish bounds
  if (locations.length === 0) {
    return {
      standard: [],
      clean: [],
      pollution_zones: []
    };
  }
  
  const minLat = Math.min(...locations.map(l => l.lat));
  const maxLat = Math.max(...locations.map(l => l.lat));
  const minLng = Math.min(...locations.map(l => l.lng));
  const maxLng = Math.max(...locations.map(l => l.lng));
  
  // Create a start and end point at opposite corners
  const start = { lat: minLat, lng: minLng };
  const end = { lat: maxLat, lng: maxLng };
  
  // Generate a standard route
  const standardRoute = [
    start,
    { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
    end
  ];
  
  // Generate a cleaner route that avoids pollution zones
  let cleanerRoute = [start];
  let currentPoint = start;
  
  // Sort pollution zones by value (highest first)
  const sortedZones = [...pollutionZones].sort((a, b) => b.value - a.value);
  
  // Create intermediate points that avoid high pollution areas
  const steps = 5;
  for (let i = 1; i < steps; i++) {
    // Calculate next direct point
    const directPoint = {
      lat: start.lat + (end.lat - start.lat) * (i / steps),
      lng: start.lng + (end.lng - start.lng) * (i / steps)
    };
    
    // Check if point is in high pollution zone
    const isInPollutionZone = sortedZones.slice(0, 3).some(zone => {
      const distance = Math.sqrt(
        Math.pow(zone.center.lat - directPoint.lat, 2) + 
        Math.pow(zone.center.lng - directPoint.lng, 2)
      );
      return distance < 0.005; // Approximate check
    });
    
    // If in pollution zone, adjust the point
    if (isInPollutionZone) {
      // Simple offset to avoid the pollution
      cleanerRoute.push({
        lat: directPoint.lat + 0.005,
        lng: directPoint.lng - 0.005
      });
    } else {
      cleanerRoute.push(directPoint);
    }
    
    currentPoint = cleanerRoute[cleanerRoute.length - 1];
  }
  
  cleanerRoute.push(end);
  
  return {
    standard: standardRoute,
    clean: cleanerRoute,
    pollution_zones: sortedZones.slice(0, 10) // Top 10 pollution zones
  };
}
