
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DatasetStatsProps {
  datasetContent: any[] | null;
  dataPreview?: any;
  fileSize: number;
}

export function DatasetStats({ datasetContent, dataPreview, fileSize }: DatasetStatsProps) {
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

  return (
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
            <p className="text-2xl font-semibold">{(fileSize / 1024).toFixed(2)} KB</p>
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

        {dataPreview && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Data Preview</h3>
            <div className="border rounded-lg p-4 overflow-auto max-h-60">
              <pre className="text-xs">
                {JSON.stringify(dataPreview, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
