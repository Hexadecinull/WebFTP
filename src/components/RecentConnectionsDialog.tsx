// View Layer - Recent Connections Dialog

import { useState } from 'react';
import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConnectOptions } from '@/types/ftp';

interface RecentConnection extends ConnectOptions {
  id: string;
  timestamp: number;
}

interface RecentConnectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (options: ConnectOptions) => void;
}

export const RecentConnectionsDialog = ({ open, onOpenChange, onConnect }: RecentConnectionsDialogProps) => {
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>(() => {
    const stored = localStorage.getItem('recentConnections');
    return stored ? JSON.parse(stored) : [];
  });

  const handleDelete = (id: string) => {
    const updated = recentConnections.filter(c => c.id !== id);
    setRecentConnections(updated);
    localStorage.setItem('recentConnections', JSON.stringify(updated));
  };

  const handleConnect = (conn: RecentConnection) => {
    onConnect(conn);
    onOpenChange(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Connections
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {recentConnections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent connections</p>
              </div>
            ) : (
              recentConnections.map(conn => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleConnect(conn)}
                  >
                    <p className="font-medium">{conn.host}</p>
                    <p className="text-sm text-muted-foreground">
                      {conn.protocol?.toUpperCase() || 'FTP'} - {conn.username} - {formatTimestamp(conn.timestamp)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(conn.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
