
import { useState } from 'react';
import { useAuthProtect } from '@/hooks/use-auth-protect';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatasetUploadForm } from '@/components/DatasetUploadForm';
import { DatasetList } from '@/components/DatasetList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Upload, Server, Search } from 'lucide-react';
import { DatasetViewer } from '@/components/DatasetViewer';

export default function Datasets() {
  useAuthProtect();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  
  const handleViewDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setActiveTab('view');
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Air Quality Datasets</h1>
        <p className="text-muted-foreground">
          Upload, manage, and analyze air quality datasets.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Dataset
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Manage Datasets
          </TabsTrigger>
          {selectedDatasetId && (
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              View Dataset
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Dataset</CardTitle>
              <CardDescription>
                Upload your air quality dataset in CSV or JSON format. Once uploaded, the system will automatically process it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetUploadForm />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Format Guidelines</CardTitle>
              <CardDescription>
                To ensure proper processing, please make sure your datasets follow these guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">CSV Format</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your CSV file should include headers in the first row and contain columns for:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Date/time information (e.g., timestamp, date)</li>
                    <li>Location data (e.g., latitude, longitude, station_id)</li>
                    <li>Air quality measurements (e.g., PM2.5, PM10, O3, NO2)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">JSON Format</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your JSON file should be structured as an array of objects, with each object representing a data point.
                  </p>
                  <div className="mt-2 p-3 bg-muted rounded-md text-xs">
                    <pre>
{`[
  {
    "timestamp": "2023-01-01T12:00:00Z",
    "lat": 40.63,
    "lon": 22.95,
    "pm25": 15.2,
    "pm10": 28.7,
    "o3": 42.1
  },
  ...
]`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Supported Data Sources</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can upload datasets from various sources, including:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    <li>OpenAQ data</li>
                    <li>IQAir historical data</li>
                    <li>Government air quality monitoring stations</li>
                    <li>Research institutions</li>
                    <li>tds.okfn.gr for Thessaloniki data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <DatasetList onViewDataset={handleViewDataset} />
        </TabsContent>

        <TabsContent value="view">
          {selectedDatasetId ? (
            <DatasetViewer datasetId={selectedDatasetId} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Select a dataset to view its contents.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
