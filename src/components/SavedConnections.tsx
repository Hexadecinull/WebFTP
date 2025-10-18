// View Layer - Saved Connections Management

import { useState } from 'react';
import { Plus, Trash2, Edit2, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConnectOptions } from '@/types/ftp';

interface SavedConnection extends ConnectOptions {
  id: string;
  name: string;
}

interface SavedConnectionsProps {
  onConnect: (options: ConnectOptions) => void;
}

export const SavedConnections = ({ onConnect }: SavedConnectionsProps) => {
  const [connections, setConnections] = useState<SavedConnection[]>(() => {
    const stored = localStorage.getItem('savedConnections');
    return stored ? JSON.parse(stored) : [];
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<Partial<SavedConnection>>({});

  const saveConnections = (conns: SavedConnection[]) => {
    setConnections(conns);
    localStorage.setItem('savedConnections', JSON.stringify(conns));
  };

  const handleSave = () => {
    if (!currentConnection.name || !currentConnection.host) return;

    const conn: SavedConnection = {
      id: currentConnection.id || Date.now().toString(),
      name: currentConnection.name,
      host: currentConnection.host,
      port: currentConnection.port || 21,
      username: currentConnection.username || '',
      password: currentConnection.password || '',
      protocol: currentConnection.protocol || 'ftp',
    };

    if (currentConnection.id) {
      saveConnections(connections.map(c => c.id === conn.id ? conn : c));
    } else {
      saveConnections([...connections, conn]);
    }

    setEditDialogOpen(false);
    setCurrentConnection({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this connection?')) {
      saveConnections(connections.filter(c => c.id !== id));
    }
  };

  const handleEdit = (conn: SavedConnection) => {
    setCurrentConnection(conn);
    setEditDialogOpen(true);
  };

  const handleNew = () => {
    setCurrentConnection({ protocol: 'ftp', port: 21 });
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Connections</h3>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No saved connections</p>
            </div>
          ) : (
            connections.map(conn => (
              <div
                key={conn.id}
                className="p-3 border border-border rounded-lg hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => onConnect(conn)}>
                    <p className="font-medium">{conn.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {conn.protocol?.toUpperCase() || 'FTP'} - {conn.host}:{conn.port}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(conn)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(conn.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentConnection.id ? 'Edit Connection' : 'New Connection'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Connection Name</Label>
              <Input
                value={currentConnection.name || ''}
                onChange={(e) => setCurrentConnection({ ...currentConnection, name: e.target.value })}
                placeholder="My FTP Server"
              />
            </div>

            <div>
              <Label>Protocol</Label>
              <Select
                value={currentConnection.protocol}
                onValueChange={(value) => setCurrentConnection({ ...currentConnection, protocol: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ftp">FTP</SelectItem>
                  <SelectItem value="ftps">FTPS</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Host</Label>
                <Input
                  value={currentConnection.host || ''}
                  onChange={(e) => setCurrentConnection({ ...currentConnection, host: e.target.value })}
                  placeholder="ftp.example.com"
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  type="number"
                  value={currentConnection.port || 21}
                  onChange={(e) => setCurrentConnection({ ...currentConnection, port: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Username</Label>
              <Input
                value={currentConnection.username || ''}
                onChange={(e) => setCurrentConnection({ ...currentConnection, username: e.target.value })}
                placeholder="username"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={currentConnection.password || ''}
                onChange={(e) => setCurrentConnection({ ...currentConnection, password: e.target.value })}
                placeholder="password"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
