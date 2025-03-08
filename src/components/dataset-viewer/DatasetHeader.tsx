
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface DatasetHeaderProps {
  fileName: string;
  fileType: string;
  createdAt: string;
  status?: string;
}

export function DatasetHeader({ 
  fileName, 
  fileType, 
  createdAt,
  status = 'Completed'
}: DatasetHeaderProps) {
  const fileTypeIcon = {
    csv: '📊',
    json: '📋',
    xlsx: '📈'
  };

  const statusVariant = {
    'Pending': 'outline',
    'Processing': 'secondary',
    'Completed': 'default',
    'Failed': 'destructive'
  } as const;

  const formatFileType = (type: string) => {
    return type.toUpperCase();
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center">
          <div className="mr-4 text-4xl">
            {fileTypeIcon[fileType as keyof typeof fileTypeIcon] || '📄'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{fileName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="secondary" className="text-xs">
                {formatFileType(fileType)}
              </Badge>
              
              <Badge 
                variant={statusVariant[status as keyof typeof statusVariant] || 'default'}
                className="text-xs"
              >
                {status}
              </Badge>
              
              <span className="text-xs text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {format(new Date(createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
