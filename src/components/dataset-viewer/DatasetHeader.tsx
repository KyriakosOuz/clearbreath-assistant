
import { FileText, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DatasetHeaderProps {
  fileName: string;
  fileType: string;
  createdAt: string;
}

export function DatasetHeader({ fileName, fileType, createdAt }: DatasetHeaderProps) {
  // Get file type icon
  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
      case 'json':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getFileTypeIcon()}
          Dataset: {fileName}
        </CardTitle>
        <CardDescription>
          Uploaded on {new Date(createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
