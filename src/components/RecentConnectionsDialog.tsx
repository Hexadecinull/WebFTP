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
import { useAuth } from '@/contexts/AuthContext';

interface RecentConnection {
  id: string;
  host: string;
  protocol: string;
  timestamp: number;
}

interface RecentConnectionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (options: ConnectOptions) => void;
}

function getStorageKey(userId: string | undefined): string {
  return userId ? `recentConnections_${userId}` : 'recentConnections_guest';
}

function loadRecent(userId: string | undefined): RecentConnection[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatTimestamp(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
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
}

export const RecentConnectionsDialog = ({ open, onOpenChange, onConnect }: RecentConnectionsDialogProps) => {
  const { user } = useAuth();
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>(() =>
    loadRecent(user?.id)
  );

  // Refresh when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) setRecentConnections(loadRecent(user?.id));
    onOpenChange(v);
  };

  const handleDelete = (id: string) => {
    const key = getStorageKey(user?.id);
    const updated = recentConnections.filter(c => c.id !== id);
    setRecentConnections(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    const key = getStorageKey(user?.id);
    localStorage.removeItem(key);
    setRecentConnections([]);
  };

  // Reconnect with minimal options — the user will need to re-enter password
  // (we deliberately don't store passwords in recent connections)
  const handleConnect = (conn: RecentConnection) => {
    onConnect({
      host: conn.host,
      port: 21,
      username: 'anonymous',
      password: '',
      protocol: (conn.protocol as ConnectOptions['protocol']) || 'ftp',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Connections
            </DialogTitle>
            {recentConnections.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-muted-foreground text-xs">
                Clear all
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {recentConnections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent connections</p>
              </div>
            ) : (
              recentConnections.map(conn => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => handleConnect(conn)}>
                    <p className="font-medium truncate">{conn.host}</p>
                    <p className="text-sm text-muted-foreground">
                      {(conn.protocol || 'FTP').toUpperCase()} — {formatTimestamp(conn.timestamp)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
