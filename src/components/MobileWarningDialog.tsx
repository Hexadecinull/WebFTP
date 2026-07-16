// View Layer - Mobile Warning Dialog
// Shown once per session when a mobile device is detected — WebFTP's file
// management features are not yet optimized for small touch screens.

import { Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface MobileWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileWarningDialog = ({ open, onOpenChange }: MobileWarningDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Best on desktop</DialogTitle>
          <DialogDescription className="text-center">
            WebFTP is currently optimized for desktop use. Some features may be
            difficult to use on a phone or tablet. We're actively working on a
            proper mobile experience — thanks for your patience!
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Continue Anyway
        </Button>
      </DialogContent>
    </Dialog>
  );
};
