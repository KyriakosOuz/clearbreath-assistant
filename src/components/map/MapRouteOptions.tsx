
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MapRouteOptionsProps {
  routeType: 'standard' | 'clean';
  onRouteTypeChange: (value: 'standard' | 'clean') => void;
}

export function MapRouteOptions({ routeType, onRouteTypeChange }: MapRouteOptionsProps) {
  return (
    <Card className="w-64">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Route Options</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Select value={routeType} onValueChange={(value) => onRouteTypeChange(value as 'standard' | 'clean')}>
          <SelectTrigger>
            <SelectValue placeholder="Select route type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                Standard Route
              </div>
            </SelectItem>
            <SelectItem value="clean">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                Clean Air Route
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <div className="mt-4">
          <Badge className="mb-2">Legend</Badge>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              <span>High Pollution</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Medium Pollution</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span>Low Pollution</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
