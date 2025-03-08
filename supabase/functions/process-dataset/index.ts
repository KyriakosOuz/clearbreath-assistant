
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

// Simple ML-like processing function (in a real scenario, this would use actual ML libraries)
function processDataset(data: any[]) {
  console.log("Processing dataset with", data.length, "rows");
  
  // Extract location data if available
  const locations = data
    .filter(row => row.latitude && row.longitude && row.pollutant_value)
    .map(row => ({
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      value: parseFloat(row.pollutant_value),
      timestamp: row.timestamp || new Date().toISOString(),
    }));

  // Group pollution data by similar locations (simple clustering)
  const pollutionZones = [];
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
  
  // Generate sample routes (this is simplified - would be replaced with actual routing algorithm)
  const generateRoutes = () => {
    // Get min and max coordinates to establish bounds
    if (locations.length === 0) {
      return [];
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
  };

  return {
    pollutionZones,
    routes: generateRoutes(),
    summary: {
      total_points: locations.length,
      pollution_zones: pollutionZones.length,
    }
  };
}

// Parse CSV data
function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      return row;
    });
}

// Parse JSON data
function parseJSON(jsonContent: string) {
  try {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }
}

// Parse XLSX data
function parseXLSX(fileData: ArrayBuffer) {
  try {
    const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error("Error parsing XLSX:", error);
    return [];
  }
}

serve(async (req) => {
  try {
    // Get the request body
    const { datasetId } = await req.json();
    
    if (!datasetId) {
      return new Response(
        JSON.stringify({ error: "Dataset ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Processing dataset: ${datasetId}`);
    
    // Update dataset status to Processing
    const { error: updateError } = await supabase
      .from('air_quality_datasets')
      .update({ status: 'Processing' })
      .eq('id', datasetId);
      
    if (updateError) {
      console.error("Error updating dataset status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update dataset status" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get dataset information
    const { data: dataset, error: fetchError } = await supabase
      .from('air_quality_datasets')
      .select('*')
      .eq('id', datasetId)
      .single();
      
    if (fetchError || !dataset) {
      console.error("Error fetching dataset:", fetchError);
      return new Response(
        JSON.stringify({ error: "Dataset not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('datasets')
      .download(dataset.file_name);
      
    if (downloadError || !fileData) {
      console.error("Error downloading file:", downloadError);
      
      // Update dataset status to Failed
      await supabase
        .from('air_quality_datasets')
        .update({ status: 'Failed' })
        .eq('id', datasetId);
        
      return new Response(
        JSON.stringify({ error: "Failed to download dataset file" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Parse the file content based on file type
    let parsedData: any[] = [];
    
    if (dataset.file_type === 'csv') {
      const fileContent = await fileData.text();
      parsedData = parseCSV(fileContent);
    } else if (dataset.file_type === 'json') {
      const fileContent = await fileData.text();
      parsedData = parseJSON(fileContent);
    } else if (dataset.file_type === 'xlsx') {
      const fileArrayBuffer = await fileData.arrayBuffer();
      parsedData = parseXLSX(fileArrayBuffer);
    }
    
    if (parsedData.length === 0) {
      console.error("No data parsed from file");
      
      // Update dataset status to Failed
      await supabase
        .from('air_quality_datasets')
        .update({ status: 'Failed' })
        .eq('id', datasetId);
        
      return new Response(
        JSON.stringify({ error: "No data found in file" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Process the data
    const processedResults = processDataset(parsedData);
    
    // Get a sample of the data for preview (first 5 rows)
    const dataPreview = parsedData.slice(0, 5);
    
    // Get column names
    const columnNames = Object.keys(parsedData[0]);
    
    // Update the dataset with processed information
    const { error: updateDatasetError } = await supabase
      .from('air_quality_datasets')
      .update({
        status: 'Completed',
        data_preview: dataPreview,
        column_names: columnNames,
        row_count: parsedData.length
      })
      .eq('id', datasetId);
      
    if (updateDatasetError) {
      console.error("Error updating dataset:", updateDatasetError);
      return new Response(
        JSON.stringify({ error: "Failed to update dataset with processed results" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Create a new prediction record
    const { data: prediction, error: predictionError } = await supabase
      .from('pollution_predictions')
      .insert({
        dataset_id: datasetId,
        predicted_pollution_zones: processedResults.pollutionZones,
        generated_routes: processedResults.routes,
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
        message: "Dataset processed successfully",
        dataset_id: datasetId,
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
