
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, FileText, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/DataTable';
import { toast } from 'sonner';

interface DatasetViewerProps {
  datasetId: string;
}

export function DatasetViewer({ datasetId }: DatasetViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dataset details
  const { data: dataset, isLoading, error } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('air_quality_datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    }
  });

  // Fetch dataset full contents
  const { data: datasetContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['datasetContent', datasetId],
    queryFn: async () => {
      if (!dataset?.file_name) return null;

      try {
        // Download the file content
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_name);

        if (downloadError) {
          throw downloadError;
        }

        // Parse the file content based on type
        const text = await fileData.text();
        let parsedData;

        if (dataset.file_type === 'json') {
          parsedData = JSON.parse(text);
        } else if (dataset.file_type === 'csv') {
          parsedData = parseCSV(text);
        } else {
          throw new Error(`Unsupported file type: ${dataset.file_type}`);
        }

        return parsedData;
      } catch (error) {
        console.error('Error loading dataset content:', error);
        toast.error('Failed to load dataset content');
        return null;
      }
    },
    enabled: !!dataset?.file_name
  });

  // Parse CSV data
  const parseCSV = (csvContent: string) => {
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
  };

  // Filter dataset content based on search term
  const filteredContent = useMemo(() => {
    if (!datasetContent || !Array.isArray(datasetContent)) return [];
    
    if (!searchTerm.trim()) return datasetContent;
    
    return datasetContent.filter(row => {
      return Object.entries(row).some(([key, value]) => {
        const stringValue = String(value).toLowerCase();
        return key.toLowerCase().includes(searchTerm.toLowerCase()) || 
               stringValue.includes(searchTerm.toLowerCase());
      });
    });
  }, [datasetContent, searchTerm]);

  // Calculate dataset statistics
  const datasetStats = useMemo(() => {
    if (!datasetContent || !Array.isArray(datasetContent) || datasetContent.length === 0) {
      return {
        rowCount: 0,
        columnCount: 0,
        columns: [],
        missingValues: {}
      };
    }

    const columns = Object.keys(datasetContent[0]);
    const missingValues: Record<string, number> = {};

    // Count missing values for each column
    columns.forEach(column => {
      const missingCount = datasetContent.filter(row => {
        const value = row[column];
        return value === undefined || value === null || value === '';
      }).length;
      
      missingValues[column] = missingCount;
    });

    return {
      rowCount: datasetContent.length,
      columnCount: columns.length,
      columns,
      missingValues
    };
  }, [datasetContent]);

  // Handle loading and error states
  if (isLoading) {
    return <DatasetViewerSkeleton />;
  }

  if (error || !dataset) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Failed to load dataset. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Dataset: {dataset.original_file_name}
          </CardTitle>
          <CardDescription>
            Uploaded on {new Date(dataset.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Full Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Summary</CardTitle>
              <CardDescription>
                Basic statistics and information about your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">Rows</h3>
                  <p className="text-2xl font-semibold">{datasetStats.rowCount}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">Columns</h3>
                  <p className="text-2xl font-semibold">{datasetStats.columnCount}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">File Size</h3>
                  <p className="text-2xl font-semibold">{(dataset.file_size / 1024).toFixed(2)} KB</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Columns</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left">Column Name</th>
                        <th className="px-4 py-2 text-left">Missing Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasetStats.columns.map((column, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{column}</td>
                          <td className="px-4 py-2">
                            {datasetStats.missingValues[column]} 
                            <span className="text-muted-foreground ml-1">
                              ({((datasetStats.missingValues[column] / datasetStats.rowCount) * 100).toFixed(1)}%)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {dataset.data_preview && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Data Preview</h3>
                  <div className="border rounded-lg p-4 overflow-auto max-h-60">
                    <pre className="text-xs">
                      {JSON.stringify(dataset.data_preview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Complete Dataset</CardTitle>
              <CardDescription>
                View and search through all records in this dataset
              </CardDescription>
              <div className="mt-2">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search by column name or value..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingContent ? (
                <div className="flex justify-center p-8">
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : filteredContent.length > 0 ? (
                <div className="overflow-auto max-h-[600px]">
                  <DataTable 
                    data={filteredContent}
                    columns={datasetStats.columns.map(col => ({
                      accessorKey: col,
                      header: col
                    }))}
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No data available or no results found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DatasetViewerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
