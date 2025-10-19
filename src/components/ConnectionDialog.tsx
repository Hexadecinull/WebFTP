// View Layer - Connection Dialog Component

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ConnectOptions } from '@/types/ftp';

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (options: ConnectOptions) => void;
  isConnecting: boolean;
}

export const ConnectionDialog = ({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
}: ConnectionDialogProps) => {
  const [formData, setFormData] = useState<ConnectOptions>({
    host: '',
    port: 21,
    username: 'anonymous',
    password: '',
    protocol: 'ftp',
  });
  const [ftpSecure, setFtpSecure] = useState(false);
  const [webdavSecure, setWebdavSecure] = useState(true);
  const [webdavAnonymous, setWebdavAnonymous] = useState(false);

  // Update port when protocol or security changes
  useEffect(() => {
    if (formData.protocol === 'ftp') {
      setFormData(prev => ({ ...prev, port: ftpSecure ? 990 : 21 }));
    } else if (formData.protocol === 'sftp') {
      setFormData(prev => ({ ...prev, port: 22 }));
    } else if (formData.protocol === 'webdav') {
      setFormData(prev => ({ ...prev, port: webdavSecure ? 443 : 80 }));
    } else if (formData.protocol === 'smb') {
      setFormData(prev => ({ ...prev, port: 445 }));
    }
  }, [formData.protocol, ftpSecure, webdavSecure]);

  // Set anonymous for WebDAV
  useEffect(() => {
    if (formData.protocol === 'webdav' && webdavAnonymous) {
      setFormData(prev => ({ ...prev, username: 'anonymous', password: '' }));
    }
  }, [webdavAnonymous, formData.protocol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  const renderProtocolFields = () => {
    switch (formData.protocol) {
      case 'ftp':
        return (
          <>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label htmlFor="ftp-secure">Use FTPS (Secure)</Label>
              <Switch
                id="ftp-secure"
                checked={ftpSecure}
                onCheckedChange={setFtpSecure}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="ftp.example.com"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </>
        );

      case 'sftp':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="sftp.example.com"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </>
        );

      case 'smb':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="host">Host / Share Path</Label>
              <Input
                id="host"
                placeholder="\\\\server\\share"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </>
        );

      case 'webdav':
        return (
          <>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label htmlFor="webdav-secure">Use HTTPS</Label>
              <Switch
                id="webdav-secure"
                checked={webdavSecure}
                onCheckedChange={setWebdavSecure}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label htmlFor="webdav-anonymous">Anonymous Access</Label>
              <Switch
                id="webdav-anonymous"
                checked={webdavAnonymous}
                onCheckedChange={setWebdavAnonymous}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="webdav.example.com"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                required
              />
            </div>
            {!webdavAnonymous && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'local':
        return (
          <div className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">Searching for local networks...</p>
              <div className="animate-pulse space-y-2">
                <div className="h-2 bg-muted rounded w-3/4 mx-auto"></div>
                <div className="h-2 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No local networks found?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  // This will trigger opening saved connections with SMB tab
                  const event = new CustomEvent('openSavedConnectionsSMB');
                  window.dispatchEvent(event);
                }}
              >
                Manual Input
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to Server</DialogTitle>
          <DialogDescription>
            Choose your protocol and enter connection details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select
                value={formData.protocol}
                onValueChange={(value: 'ftp' | 'ftps' | 'sftp' | 'smb' | 'webdav' | 'local') =>
                  setFormData(prev => ({ ...prev, protocol: value }))
                }
              >
                <SelectTrigger id="protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ftp">FTP / FTPS</SelectItem>
                  <SelectItem value="sftp">SFTP (SSH File Transfer)</SelectItem>
                  <SelectItem value="smb">SMB (Windows Share)</SelectItem>
                  <SelectItem value="webdav">WebDAV</SelectItem>
                  <SelectItem value="local">Local Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderProtocolFields()}
          </div>

          {formData.protocol !== 'local' && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isConnecting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};