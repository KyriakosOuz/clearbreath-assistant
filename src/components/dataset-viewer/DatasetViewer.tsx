
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart2, FileText, Activity, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DatasetViewerSkeleton } from './DatasetViewerSkeleton';
import { DatasetHeader } from './DatasetHeader';
import { DatasetStats } from './DatasetStats';
import { DatasetContent } from './DatasetContent';
import { parseDataFile } from '@/utils/file-parsers';
import { DatasetAnalytics } from './DatasetAnalytics';

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

        if (dataset.file_type === 'xlsx') {
          // For XLSX files, we'll use the data_preview from the dataset
          // as parsing XLSX requires the xlsx library which we can't use in the browser
          parsedData = dataset.data_preview || [];
        } else {
          parsedData = parseDataFile(text, dataset.file_type);
        }

        return parsedData;
      } catch (error) {
        console.error('Error loading dataset content:', error);
        toast.error('Failed to load dataset content');
        return null;
      }
    },
    enabled: !!dataset?.file_name && dataset?.status === 'Completed'
  });

  // Get columns for DataTable
  const columns = datasetContent && Array.isArray(datasetContent) && datasetContent.length > 0 
    ? Object.keys(datasetContent[0]) 
    : [];

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
      <DatasetHeader 
        fileName={dataset.original_file_name}
        fileType={dataset.file_type}
        createdAt={dataset.created_at}
        status={dataset.status}
      />

      {dataset.status === 'Pending' || dataset.status === 'Processing' ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {dataset.status === 'Pending' 
                ? 'This dataset is pending processing. Process it to view statistics and data.' 
                : 'This dataset is currently being processed. Check back soon.'}
            </p>
          </CardContent>
        </Card>
      ) : (
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DatasetStats 
              datasetContent={datasetContent}
              dataPreview={dataset.data_preview}
              fileSize={dataset.file_size}
            />
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search in dataset..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <DatasetContent 
                  datasetContent={datasetContent}
                  isLoading={isLoadingContent}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  columns={columns}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <DatasetAnalytics datasetId={datasetId} datasetContent={datasetContent} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
