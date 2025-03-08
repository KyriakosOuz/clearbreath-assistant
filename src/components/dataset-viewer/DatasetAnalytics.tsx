
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

interface DatasetAnalyticsProps {
  datasetId: string;
  datasetContent: any[] | null;
}

export function DatasetAnalytics({ datasetId, datasetContent }: DatasetAnalyticsProps) {
  const airQualityAnalytics = useMemo(() => {
    if (!datasetContent || !Array.isArray(datasetContent) || datasetContent.length === 0) {
      return null;
    }

    // Extract potential air quality related columns
    const columns = Object.keys(datasetContent[0]);
    const pollutantColumns = columns.filter(col => 
      col.toLowerCase().includes('pm') ||
      col.toLowerCase().includes('o3') ||
      col.toLowerCase().includes('no2') ||
      col.toLowerCase().includes('so2') ||
      col.toLowerCase().includes('co') ||
      col.toLowerCase().includes('aqi') ||
      col.toLowerCase().includes('pollutant') ||
      col.toLowerCase().includes('value')
    );

    // If we don't have any columns that look like pollutant data, return null
    if (pollutantColumns.length === 0) {
      return null;
    }

    // Get the first pollutant column
    const primaryPollutantColumn = pollutantColumns[0];

    // Calculate air quality categories based on data
    let aqiCategories = {
      'Good (0-50)': 0,
      'Moderate (51-100)': 0,
      'Unhealthy for Sensitive Groups (101-150)': 0,
      'Unhealthy (151-200)': 0,
      'Very Unhealthy (201-300)': 0,
      'Hazardous (301+)': 0
    };

    // Process data for charts
    datasetContent.forEach(row => {
      const value = parseFloat(row[primaryPollutantColumn]);
      if (!isNaN(value)) {
        if (value <= 50) aqiCategories['Good (0-50)']++;
        else if (value <= 100) aqiCategories['Moderate (51-100)']++;
        else if (value <= 150) aqiCategories['Unhealthy for Sensitive Groups (101-150)']++;
        else if (value <= 200) aqiCategories['Unhealthy (151-200)']++;
        else if (value <= 300) aqiCategories['Very Unhealthy (201-300)']++;
        else aqiCategories['Hazardous (301+)']++;
      }
    });

    // Prepare data for pie chart
    const pieData = Object.entries(aqiCategories)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, value: count }));

    // Find location or time columns for trend analysis
    const timeColumns = columns.filter(col => 
      col.toLowerCase().includes('time') || 
      col.toLowerCase().includes('date') || 
      col.toLowerCase().includes('timestamp')
    );

    const locationColumns = columns.filter(col => 
      col.toLowerCase().includes('location') || 
      col.toLowerCase().includes('city') ||
      col.toLowerCase().includes('site') ||
      col.toLowerCase().includes('station')
    );

    // Get the top 5 highest pollution readings
    const topPollutionReadings = [...datasetContent]
      .sort((a, b) => parseFloat(b[primaryPollutantColumn]) - parseFloat(a[primaryPollutantColumn]))
      .slice(0, 5);

    // Calculate average readings by location if possible
    let locationData = [];
    if (locationColumns.length > 0) {
      const locationCol = locationColumns[0];
      const locationMap = new Map();
      
      datasetContent.forEach(row => {
        const location = row[locationCol];
        const pollutantValue = parseFloat(row[primaryPollutantColumn]);
        
        if (!isNaN(pollutantValue) && location) {
          if (!locationMap.has(location)) {
            locationMap.set(location, { 
              total: pollutantValue, 
              count: 1, 
              max: pollutantValue, 
              min: pollutantValue 
            });
          } else {
            const current = locationMap.get(location);
            current.total += pollutantValue;
            current.count += 1;
            current.max = Math.max(current.max, pollutantValue);
            current.min = Math.min(current.min, pollutantValue);
            locationMap.set(location, current);
          }
        }
      });
      
      locationData = Array.from(locationMap.entries())
        .map(([location, data]) => ({
          location,
          average: Math.round((data.total / data.count) * 100) / 100,
          max: data.max,
          min: data.min
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);
    }

    // Return all analytics data
    return {
      pollutantColumn: primaryPollutantColumn,
      aqiCategories,
      pieData,
      topPollutionReadings,
      locationData,
      hasLocationData: locationData.length > 0
    };
  }, [datasetContent]);

  if (!datasetContent || !Array.isArray(datasetContent) || datasetContent.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading dataset content...</p>
        </CardContent>
      </Card>
    );
  }

  // If no air quality related columns found
  if (!airQualityAnalytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No air quality metrics detected in this dataset. 
            Analytics works best with datasets containing columns for pollutants like PM2.5, PM10, O3, NO2, etc.
          </p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336', '#880e4f'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Air Quality Distribution</CardTitle>
          <CardDescription>
            Distribution of air quality measurements based on {airQualityAnalytics.pollutantColumn}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={airQualityAnalytics.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {airQualityAnalytics.pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} measurements`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {airQualityAnalytics.hasLocationData && (
        <Card>
          <CardHeader>
            <CardTitle>Air Quality by Location</CardTitle>
            <CardDescription>
              Average values of {airQualityAnalytics.pollutantColumn} by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={airQualityAnalytics.locationData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name={`Avg ${airQualityAnalytics.pollutantColumn}`} />
                  <Bar dataKey="max" fill="#82ca9d" name={`Max ${airQualityAnalytics.pollutantColumn}`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Safety Recommendation</CardTitle>
          <CardDescription>
            Based on your air quality dataset analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate percentage of unhealthy readings
            const totalReadings = Object.values(airQualityAnalytics.aqiCategories).reduce((a, b) => a + b, 0);
            const unhealthyReadings = 
              airQualityAnalytics.aqiCategories['Unhealthy for Sensitive Groups (101-150)'] +
              airQualityAnalytics.aqiCategories['Unhealthy (151-200)'] +
              airQualityAnalytics.aqiCategories['Very Unhealthy (201-300)'] +
              airQualityAnalytics.aqiCategories['Hazardous (301+)'];
            
            const unhealthyPercentage = (unhealthyReadings / totalReadings) * 100;
            
            if (unhealthyPercentage > 50) {
              return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">High Risk - Not Safe to Move Outside</h3>
                  <p className="mt-2">
                    Based on your dataset, {unhealthyPercentage.toFixed(1)}% of readings are in unhealthy ranges. 
                    It's recommended to stay indoors, use air purifiers, and keep windows closed. 
                    If you must go outside, wear a proper mask (N95 or better) and use the Clean Route feature 
                    to find the least polluted path.
                  </p>
                </div>
              );
            } else if (unhealthyPercentage > 25) {
              return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Moderate Risk - Caution Advised</h3>
                  <p className="mt-2">
                    Your dataset shows {unhealthyPercentage.toFixed(1)}% of readings in unhealthy ranges. 
                    Sensitive groups (elderly, children, those with respiratory conditions) should limit outdoor activities. 
                    Others should consider reducing prolonged outdoor exertion. 
                    Use the Clean Route feature to find better paths when traveling.
                  </p>
                </div>
              );
            } else {
              return (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Low Risk - Generally Safe</h3>
                  <p className="mt-2">
                    Your dataset indicates good air quality conditions with only {unhealthyPercentage.toFixed(1)}% of readings 
                    in unhealthy ranges. It's generally safe to be outside, but always check current conditions 
                    before extended outdoor activities. The Clean Route feature can still help you find optimal paths.
                  </p>
                </div>
              );
            }
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highest Pollution Readings</CardTitle>
          <CardDescription>
            The top 5 highest {airQualityAnalytics.pollutantColumn} values in the dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Rank</th>
                  <th className="p-2 text-left">{airQualityAnalytics.pollutantColumn}</th>
                  {Object.keys(airQualityAnalytics.topPollutionReadings[0])
                    .filter(key => key !== airQualityAnalytics.pollutantColumn)
                    .slice(0, 3)
                    .map(key => (
                      <th key={key} className="p-2 text-left">{key}</th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                {airQualityAnalytics.topPollutionReadings.map((reading, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{index + 1}</td>
                    <td className="p-2 font-medium text-red-600 dark:text-red-400">
                      {reading[airQualityAnalytics.pollutantColumn]}
                    </td>
                    {Object.keys(reading)
                      .filter(key => key !== airQualityAnalytics.pollutantColumn)
                      .slice(0, 3)
                      .map(key => (
                        <td key={key} className="p-2">{reading[key]}</td>
                      ))
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
