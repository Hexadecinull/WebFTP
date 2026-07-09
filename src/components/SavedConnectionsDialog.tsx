// View Layer - Saved Connections Dialog

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SavedConnections } from '@/components/SavedConnections';
import { ConnectOptions } from '@/types/ftp';

interface SavedConnectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (options: ConnectOptions) => void;
}

export const SavedConnectionsDialog = ({ open, onOpenChange, onConnect }: SavedConnectionsDialogProps) => {
  const handleConnect = (options: ConnectOptions) => {
    onConnect(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved Connections</DialogTitle>
          <DialogDescription>
            Your saved server connections. Click one to connect.
          </DialogDescription>
        </DialogHeader>
        <SavedConnections onConnect={handleConnect} />
      </DialogContent>
    </Dialog>
  );
};
