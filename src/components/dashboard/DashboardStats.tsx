
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Database, Upload, RefreshCw, Search } from 'lucide-react';
import { AirQualityDataset } from '@/types/dataset';

interface DashboardStatsProps {
  datasets: AirQualityDataset[];
}

export function DashboardStats({ datasets }: DashboardStatsProps) {
  const getDatasetStats = () => {
    const totalDatasets = datasets.length;
    const completedDatasets = datasets.filter(d => d.status === 'Completed').length;
    const pendingDatasets = datasets.filter(d => d.status === 'Pending' || d.status === 'Processing').length;
    const failedDatasets = datasets.filter(d => d.status === 'Failed').length;
    
    const totalRows = datasets.reduce((acc, dataset) => {
      return acc + (dataset.row_count || 0);
    }, 0);
    
    return { totalDatasets, completedDatasets, pendingDatasets, failedDatasets, totalRows };
  };

  const stats = getDatasetStats();

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDatasets}</div>
          <p className="text-xs text-muted-foreground">Uploaded datasets</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedDatasets}</div>
          <div className="flex items-center text-xs text-green-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span>{stats.totalDatasets > 0 ? Math.round((stats.completedDatasets / stats.totalDatasets) * 100) : 0}% of total</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingDatasets}</div>
          <div className="flex items-center text-xs text-blue-600">
            <span>Awaiting completion</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Across all datasets</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
