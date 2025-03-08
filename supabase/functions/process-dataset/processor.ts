
// Dataset processing logic with enhanced ML analysis

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

interface Trend {
  period: string;
  averageValue: number;
  changePercent: number;
}

interface Correlation {
  factor: string;
  strength: number; // -1 to 1
  description: string;
}

interface MLInsight {
  type: string;
  description: string;
  confidence: number; // 0 to 1
  relevance: number; // 0 to 1
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
    average_pollution: number;
    max_pollution: number;
    min_pollution: number;
  };
  trends: Trend[];
  correlations: Correlation[];
  mlInsights: MLInsight[];
  predictions: {
    nextDayPrediction: number;
    nextWeekTrend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
  };
}

// Enhanced ML-powered processing function
export function processDataset(data: any[]): ProcessedResults {
  console.log("Processing dataset with ML analysis for", data.length, "rows");
  
  // Extract location data if available
  const locations: Point[] = data
    .filter(row => row.latitude && row.longitude && row.pollutant_value)
    .map(row => ({
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
      value: parseFloat(row.pollutant_value),
      timestamp: row.timestamp || new Date().toISOString(),
    }));

  // Group pollution data by similar locations (enhanced clustering)
  const pollutionZones: PollutionZone[] = performEnhancedClustering(locations);
  
  // Generate routes
  const routes = generateOptimizedRoutes(locations, pollutionZones);
  
  // Calculate pollution statistics
  const pollutionValues = locations.map(loc => loc.value);
  const avgPollution = pollutionValues.length > 0 
    ? pollutionValues.reduce((sum, val) => sum + val, 0) / pollutionValues.length 
    : 0;
  const maxPollution = pollutionValues.length > 0 ? Math.max(...pollutionValues) : 0;
  const minPollution = pollutionValues.length > 0 ? Math.min(...pollutionValues) : 0;
  
  // Analyze temporal trends
  const trends = analyzeTrends(locations);
  
  // Find correlations in the data
  const correlations = findCorrelations(data);
  
  // Generate ML insights
  const mlInsights = generateInsights(data, locations, pollutionZones);
  
  // Predict future values
  const predictions = predictFutureValues(locations);
  
  return {
    pollutionZones,
    routes,
    summary: {
      total_points: locations.length,
      pollution_zones: pollutionZones.length,
      average_pollution: avgPollution,
      max_pollution: maxPollution,
      min_pollution: minPollution
    },
    trends,
    correlations,
    mlInsights,
    predictions
  };
}

// Enhanced clustering algorithm
function performEnhancedClustering(locations: Point[]): PollutionZone[] {
  const pollutionZones: PollutionZone[] = [];
  const processedLocations = new Set();
  
  // DBSCAN-inspired clustering algorithm
  const epsilon = 0.003; // ~300 meters
  const minPoints = 3; // Minimum points for a core point
  
  locations.forEach((loc) => {
    const locKey = `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
    if (processedLocations.has(locKey)) return;
    
    processedLocations.add(locKey);
    
    // Find nearby points (within epsilon)
    const nearbyPoints = locations.filter(
      other => 
        Math.abs(other.lat - loc.lat) < epsilon && 
        Math.abs(other.lng - loc.lng) < epsilon
    );
    
    if (nearbyPoints.length >= minPoints) {
      // Calculate centroid
      const sumLat = nearbyPoints.reduce((sum, pt) => sum + pt.lat, 0);
      const sumLng = nearbyPoints.reduce((sum, pt) => sum + pt.lng, 0);
      const centroidLat = sumLat / nearbyPoints.length;
      const centroidLng = sumLng / nearbyPoints.length;
      
      // Calculate average pollution value with weighted values for recent measurements
      let totalWeight = 0;
      let weightedSum = 0;
      
      nearbyPoints.forEach(pt => {
        const timestamp = new Date(pt.timestamp).getTime();
        const now = new Date().getTime();
        const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24);
        const weight = Math.max(0.5, 1 - (ageInDays / 30)); // More weight to recent readings
        
        weightedSum += pt.value * weight;
        totalWeight += weight;
      });
      
      const avgValue = totalWeight > 0 ? weightedSum / totalWeight : 0;
      
      // Calculate adaptive radius based on point density
      const distances = nearbyPoints.map(pt => 
        Math.sqrt(Math.pow(pt.lat - centroidLat, 2) + Math.pow(pt.lng - centroidLng, 2))
      );
      const maxDistance = Math.max(...distances);
      const radius = Math.max(300, maxDistance * 111000); // Convert to meters (approx)
      
      pollutionZones.push({
        center: { lat: centroidLat, lng: centroidLng },
        radius: radius,
        value: avgValue,
        points: nearbyPoints.length,
      });
      
      // Mark all nearby points as processed
      nearbyPoints.forEach(pt => {
        const ptKey = `${pt.lat.toFixed(4)},${pt.lng.toFixed(4)}`;
        processedLocations.add(ptKey);
      });
    }
  });
  
  return pollutionZones;
}

// Generate optimized routes
function generateOptimizedRoutes(locations: Point[], pollutionZones: PollutionZone[]) {
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
  
  // Generate a cleaner route that avoids pollution zones using A* inspired algorithm
  let cleanerRoute = [start];
  
  // Sort pollution zones by value (highest first)
  const sortedZones = [...pollutionZones].sort((a, b) => b.value - a.value);
  
  // Create intermediate points that avoid high pollution areas
  const steps = 8; // More steps for smoother path
  let currentPoint = start;
  
  for (let i = 1; i < steps; i++) {
    // Calculate next direct point
    const targetPoint = {
      lat: start.lat + (end.lat - start.lat) * (i / steps),
      lng: start.lng + (end.lng - start.lng) * (i / steps)
    };
    
    // Check pollution along potential paths
    const candidates = [];
    const variations = 5;
    
    // Generate candidate points with varying offsets
    for (let v = 0; v < variations; v++) {
      const angle = (v / variations) * Math.PI * 2;
      const offset = 0.005; // Base offset
      const candidate = {
        lat: targetPoint.lat + Math.cos(angle) * offset,
        lng: targetPoint.lng + Math.sin(angle) * offset
      };
      
      // Score each candidate (lower is better)
      let score = 0;
      
      // Distance to target (we want to generally move toward the end)
      const distToTarget = Math.sqrt(
        Math.pow(candidate.lat - end.lat, 2) + 
        Math.pow(candidate.lng - end.lng, 2)
      );
      score += distToTarget * 10;
      
      // Pollution penalty
      sortedZones.forEach(zone => {
        const distToZone = Math.sqrt(
          Math.pow(candidate.lat - zone.center.lat, 2) + 
          Math.pow(candidate.lng - zone.center.lng, 2)
        );
        
        if (distToZone < 0.01) { // If close to a zone
          score += (zone.value / distToZone) * 5; // Higher penalty for high pollution zones
        }
      });
      
      candidates.push({ point: candidate, score });
    }
    
    // Choose the best candidate
    candidates.sort((a, b) => a.score - b.score);
    const bestCandidate = candidates[0].point;
    
    cleanerRoute.push(bestCandidate);
    currentPoint = bestCandidate;
  }
  
  cleanerRoute.push(end);
  
  return {
    standard: standardRoute,
    clean: cleanerRoute,
    pollution_zones: sortedZones.slice(0, 10) // Top 10 pollution zones
  };
}

// Analyze temporal trends in the data
function analyzeTrends(locations: Point[]): Trend[] {
  if (locations.length === 0) return [];
  
  // Sort locations by timestamp
  const sortedLocations = [...locations].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Get date range
  const firstDate = new Date(sortedLocations[0].timestamp);
  const lastDate = new Date(sortedLocations[sortedLocations.length - 1].timestamp);
  const dayRange = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Group data by periods (daily, weekly, monthly) based on available data
  const trends: Trend[] = [];
  
  // If we have at least 2 days of data
  if (dayRange >= 2) {
    // Daily trend
    const dailyData = groupLocationsByPeriod(sortedLocations, 'day');
    const dailyAvgs = Object.keys(dailyData).map(date => {
      const values = dailyData[date].map(loc => loc.value);
      return {
        date,
        avg: values.reduce((sum, val) => sum + val, 0) / values.length
      };
    });
    
    // Calculate daily change
    if (dailyAvgs.length >= 2) {
      const lastDay = dailyAvgs[dailyAvgs.length - 1];
      const prevDay = dailyAvgs[dailyAvgs.length - 2];
      const changePercent = ((lastDay.avg - prevDay.avg) / prevDay.avg) * 100;
      
      trends.push({
        period: 'daily',
        averageValue: lastDay.avg,
        changePercent
      });
    }
  }
  
  // If we have at least 2 weeks of data
  if (dayRange >= 14) {
    // Weekly trend
    const weeklyData = groupLocationsByPeriod(sortedLocations, 'week');
    const weeklyAvgs = Object.keys(weeklyData).map(week => {
      const values = weeklyData[week].map(loc => loc.value);
      return {
        week,
        avg: values.reduce((sum, val) => sum + val, 0) / values.length
      };
    });
    
    // Calculate weekly change
    if (weeklyAvgs.length >= 2) {
      const lastWeek = weeklyAvgs[weeklyAvgs.length - 1];
      const prevWeek = weeklyAvgs[weeklyAvgs.length - 2];
      const changePercent = ((lastWeek.avg - prevWeek.avg) / prevWeek.avg) * 100;
      
      trends.push({
        period: 'weekly',
        averageValue: lastWeek.avg,
        changePercent
      });
    }
  }
  
  // If we have at least 2 months of data
  if (dayRange >= 60) {
    // Monthly trend
    const monthlyData = groupLocationsByPeriod(sortedLocations, 'month');
    const monthlyAvgs = Object.keys(monthlyData).map(month => {
      const values = monthlyData[month].map(loc => loc.value);
      return {
        month,
        avg: values.reduce((sum, val) => sum + val, 0) / values.length
      };
    });
    
    // Calculate monthly change
    if (monthlyAvgs.length >= 2) {
      const lastMonth = monthlyAvgs[monthlyAvgs.length - 1];
      const prevMonth = monthlyAvgs[monthlyAvgs.length - 2];
      const changePercent = ((lastMonth.avg - prevMonth.avg) / prevMonth.avg) * 100;
      
      trends.push({
        period: 'monthly',
        averageValue: lastMonth.avg,
        changePercent
      });
    }
  }
  
  return trends;
}

// Helper function to group locations by period
function groupLocationsByPeriod(locations: Point[], period: 'day' | 'week' | 'month'): Record<string, Point[]> {
  const groups: Record<string, Point[]> = {};
  
  locations.forEach(loc => {
    const date = new Date(loc.timestamp);
    let key = '';
    
    if (period === 'day') {
      key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    } else if (period === 'week') {
      // Get the week number
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNumber}`;
    } else if (period === 'month') {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(loc);
  });
  
  return groups;
}

// Find correlations in the data
function findCorrelations(data: any[]): Correlation[] {
  if (data.length === 0) return [];
  
  const correlations: Correlation[] = [];
  
  // Look for potential correlation factors
  const firstRow = data[0];
  const potentialFactors = Object.keys(firstRow).filter(key => {
    const value = firstRow[key];
    return (
      // Look for numeric or boolean values that might correlate with pollution
      (typeof value === 'number' || !isNaN(parseFloat(value))) &&
      !key.includes('lat') && 
      !key.includes('lon') && 
      !key.includes('id') &&
      !key.includes('timestamp')
    );
  });
  
  // For each potential factor, calculate correlation with the pollution value
  potentialFactors.forEach(factor => {
    // Skip if it's the pollutant_value itself
    if (factor === 'pollutant_value') return;
    
    // Extract pairs of values
    const pairs = data
      .filter(row => 
        row[factor] !== undefined && 
        row[factor] !== null && 
        row.pollutant_value !== undefined && 
        row.pollutant_value !== null
      )
      .map(row => ({
        x: typeof row[factor] === 'string' ? parseFloat(row[factor]) : row[factor],
        y: typeof row.pollutant_value === 'string' ? parseFloat(row.pollutant_value) : row.pollutant_value
      }))
      .filter(pair => !isNaN(pair.x) && !isNaN(pair.y));
    
    if (pairs.length < 5) return; // Not enough data points
    
    // Calculate Pearson correlation coefficient
    const correlation = calculatePearsonCorrelation(pairs);
    
    // Only include significant correlations
    if (Math.abs(correlation) > 0.3) {
      let description = '';
      
      if (correlation > 0.7) {
        description = `Strong positive correlation with ${factor}`;
      } else if (correlation > 0.3) {
        description = `Moderate positive correlation with ${factor}`;
      } else if (correlation < -0.7) {
        description = `Strong negative correlation with ${factor}`;
      } else if (correlation < -0.3) {
        description = `Moderate negative correlation with ${factor}`;
      }
      
      correlations.push({
        factor,
        strength: correlation,
        description
      });
    }
  });
  
  return correlations.sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength));
}

// Calculate Pearson correlation coefficient
function calculatePearsonCorrelation(pairs: { x: number, y: number }[]): number {
  const n = pairs.length;
  
  // Calculate means
  const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0);
  const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let varX = 0;
  let varY = 0;
  
  pairs.forEach(pair => {
    const diffX = pair.x - meanX;
    const diffY = pair.y - meanY;
    covariance += diffX * diffY;
    varX += diffX * diffX;
    varY += diffY * diffY;
  });
  
  // Avoid division by zero
  if (varX === 0 || varY === 0) return 0;
  
  const stdX = Math.sqrt(varX);
  const stdY = Math.sqrt(varY);
  
  return covariance / (stdX * stdY);
}

// Generate ML insights
function generateInsights(data: any[], locations: Point[], pollutionZones: PollutionZone[]): MLInsight[] {
  const insights: MLInsight[] = [];
  
  // Calculate basic statistics
  const pollutionValues = locations.map(loc => loc.value);
  const avgPollution = pollutionValues.length > 0 
    ? pollutionValues.reduce((sum, val) => sum + val, 0) / pollutionValues.length 
    : 0;
  
  // Check if there are high pollution zones
  const highPollutionZones = pollutionZones.filter(zone => zone.value > avgPollution * 1.5);
  
  if (highPollutionZones.length > 0) {
    insights.push({
      type: 'pollution_hotspot',
      description: `Identified ${highPollutionZones.length} pollution hotspots with significantly higher than average readings`,
      confidence: 0.85,
      relevance: 0.9
    });
  }
  
  // Check for seasonal patterns
  if (locations.length > 0) {
    // Group by month
    const monthlyData = groupLocationsByPeriod(locations, 'month');
    const monthKeys = Object.keys(monthlyData);
    
    if (monthKeys.length >= 2) {
      insights.push({
        type: 'seasonal_pattern',
        description: 'Detected potential seasonal patterns in pollution levels',
        confidence: 0.7,
        relevance: 0.8
      });
    }
  }
  
  // Look for potential data anomalies
  const stdDev = calculateStandardDeviation(pollutionValues);
  const outliers = pollutionValues.filter(val => Math.abs(val - avgPollution) > 2 * stdDev);
  
  if (outliers.length > 0) {
    insights.push({
      type: 'data_anomaly',
      description: `Detected ${outliers.length} outlier readings that may represent measurement errors or unusual events`,
      confidence: 0.75,
      relevance: 0.7
    });
  }
  
  // Look for potential correlations with time of day
  const hasDailyPattern = checkForDailyPattern(locations);
  if (hasDailyPattern) {
    insights.push({
      type: 'daily_pattern',
      description: 'Identified potential daily pattern in pollution levels, possibly related to traffic or industrial activity',
      confidence: 0.8,
      relevance: 0.85
    });
  }
  
  return insights;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

// Check for daily patterns in pollution data
function checkForDailyPattern(locations: Point[]): boolean {
  // Group by hour of day
  const hourlyGroups: Record<number, number[]> = {};
  
  locations.forEach(loc => {
    if (!loc.timestamp) return;
    
    const date = new Date(loc.timestamp);
    const hour = date.getHours();
    
    if (!hourlyGroups[hour]) {
      hourlyGroups[hour] = [];
    }
    
    hourlyGroups[hour].push(loc.value);
  });
  
  // Calculate average by hour
  const hourlyAverages: { hour: number, avg: number }[] = [];
  
  Object.keys(hourlyGroups).forEach(hourStr => {
    const hour = parseInt(hourStr);
    const values = hourlyGroups[hour];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    hourlyAverages.push({ hour, avg });
  });
  
  // Need at least a few hours to detect a pattern
  if (hourlyAverages.length < 6) return false;
  
  // Sort by hour
  hourlyAverages.sort((a, b) => a.hour - b.hour);
  
  // Check for variation between hours
  const allAvgs = hourlyAverages.map(h => h.avg);
  const minAvg = Math.min(...allAvgs);
  const maxAvg = Math.max(...allAvgs);
  
  // If there's significant variation between hours, there's likely a daily pattern
  return (maxAvg - minAvg) / minAvg > 0.2;
}

// Predict future values based on historical data
function predictFutureValues(locations: Point[]): { nextDayPrediction: number, nextWeekTrend: 'increasing' | 'stable' | 'decreasing', confidence: number } {
  if (locations.length < 5) {
    return {
      nextDayPrediction: 0,
      nextWeekTrend: 'stable',
      confidence: 0
    };
  }
  
  // Sort by timestamp
  const sortedLocations = [...locations].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Group by day
  const dailyData = groupLocationsByPeriod(sortedLocations, 'day');
  const dailyAverages = Object.keys(dailyData).map(day => {
    const values = dailyData[day].map(loc => loc.value);
    return {
      day,
      avg: values.reduce((sum, val) => sum + val, 0) / values.length
    };
  });
  
  // Need at least a few days of data
  if (dailyAverages.length < 3) {
    return {
      nextDayPrediction: dailyAverages[dailyAverages.length - 1].avg,
      nextWeekTrend: 'stable',
      confidence: 0.3
    };
  }
  
  // Simple linear regression to predict next day
  const xValues = Array.from({ length: dailyAverages.length }, (_, i) => i);
  const yValues = dailyAverages.map(d => d.avg);
  
  const { slope, intercept } = linearRegression(xValues, yValues);
  
  // Predict next day
  const nextDayPrediction = intercept + slope * dailyAverages.length;
  
  // Determine weekly trend
  let nextWeekTrend: 'increasing' | 'stable' | 'decreasing';
  if (slope > 0.05) {
    nextWeekTrend = 'increasing';
  } else if (slope < -0.05) {
    nextWeekTrend = 'decreasing';
  } else {
    nextWeekTrend = 'stable';
  }
  
  // Calculate confidence based on data consistency
  const predictions = xValues.map(x => intercept + slope * x);
  const errors = predictions.map((pred, i) => Math.abs(pred - yValues[i]));
  const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  const avgValue = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
  
  // Lower confidence if error is high relative to average value
  const errorRatio = avgError / avgValue;
  const confidence = Math.max(0.3, Math.min(0.9, 1 - errorRatio));
  
  return {
    nextDayPrediction,
    nextWeekTrend,
    confidence
  };
}

// Linear regression helper
function linearRegression(xValues: number[], yValues: number[]): { slope: number, intercept: number } {
  const n = xValues.length;
  
  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Calculate intercept
  const intercept = yMean - slope * xMean;
  
  return { slope, intercept };
}
