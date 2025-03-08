
import React from 'react';
import { Map } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapEmptyStateProps {
  title: string;
  description: string;
  width?: string;
  height?: string;
}

export function MapEmptyState({ title, description, width = '100%', height = '600px' }: MapEmptyStateProps) {
  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      <Card className="w-96">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/datasets'}>
            <Map className="mr-2 h-4 w-4" />
            Go to Datasets
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
