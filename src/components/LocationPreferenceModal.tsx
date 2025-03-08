
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Check } from 'lucide-react';

interface LocationPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locationName: string;
}

export function LocationPreferenceModal({
  isOpen,
  onClose,
  onConfirm,
  locationName,
}: LocationPreferenceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Preferred Location</DialogTitle>
          <DialogDescription>
            Do you want to set this as your preferred location for air quality updates?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 pt-4 pb-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{locationName}</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          You'll receive air quality notifications only for this location, and we'll remember
          this choice for future visits.
        </p>

        <DialogFooter className="flex space-x-2 sm:justify-start">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            <span>Set as Preferred</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
