
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Skeleton } from '@/components/ui/skeleton';

interface DatasetContentProps {
  datasetContent: any[] | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  columns: string[];
}

export function DatasetContent({
  datasetContent,
  isLoading,
  searchTerm,
  onSearchChange,
  columns
}: DatasetContentProps) {
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

  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="overflow-auto max-h-[600px]">
            <DataTable 
              data={filteredContent}
              columns={columns.map(col => ({
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
  );
}
