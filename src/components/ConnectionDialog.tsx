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
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

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
  const [ftpSecure, setFtpSecure] = useState(true);
  const [webdavSecure, setWebdavSecure] = useState(true);
  const [showFtpMore, setShowFtpMore] = useState(false);
  const [showSftpMore, setShowSftpMore] = useState(false);
  const [showSmbMore, setShowSmbMore] = useState(false);
  const [showWebdavMore, setShowWebdavMore] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [ftpMode, setFtpMode] = useState('passive');
  const [ftpSecurityMode, setFtpSecurityMode] = useState('explicit');
  const [ftpEncoding, setFtpEncoding] = useState('automatic');
  const [smbDomain, setSmbDomain] = useState('');
  const [smbVersion, setSmbVersion] = useState('automatic');
  const [privateKey, setPrivateKey] = useState<File | null>(null);

  // Update port when protocol or security changes
  useEffect(() => {
    if (formData.protocol === 'ftp') {
      setFormData(prev => ({ ...prev, port: 21 }));
    } else if (formData.protocol === 'sftp') {
      setFormData(prev => ({ ...prev, port: 22 }));
    } else if (formData.protocol === 'webdav') {
      setFormData(prev => ({ ...prev, port: webdavSecure ? 443 : 80 }));
    } else if (formData.protocol === 'smb') {
      setFormData(prev => ({ ...prev, port: 445 }));
    }
  }, [formData.protocol, webdavSecure]);

  // Auto-retract More sections when protocol changes
  useEffect(() => {
    setShowFtpMore(false);
    setShowSftpMore(false);
    setShowSmbMore(false);
    setShowWebdavMore(false);
  }, [formData.protocol]);

  // Reset protocol to FTP when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, protocol: 'ftp' }));
    }
  }, [open]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  const renderProtocolFields = () => {
    switch (formData.protocol) {
      case 'ftp':
        return (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label htmlFor="ftp-secure">Use FTPS</Label>
                <Switch
                  id="ftp-secure"
                  checked={ftpSecure}
                  onCheckedChange={setFtpSecure}
                />
              </div>
              {!ftpSecure && (
                <p className="text-xs text-warning px-3 animate-fade-in">⚠️ Not secure</p>
              )}
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
            
            {showFtpMore && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="ftp-mode">Mode</Label>
                  <Select value={ftpMode} onValueChange={setFtpMode}>
                    <SelectTrigger id="ftp-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passive">Passive</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ftp-security-mode">Security Mode</Label>
                  <Select value={ftpSecurityMode} onValueChange={setFtpSecurityMode}>
                    <SelectTrigger id="ftp-security-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="explicit">Explicit</SelectItem>
                      <SelectItem value="implicit">Implicit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ftp-encoding">Encoding</Label>
                  <Select value={ftpEncoding} onValueChange={setFtpEncoding}>
                    <SelectTrigger id="ftp-encoding">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
                      <SelectItem value="utf-16">UTF-16</SelectItem>
                      <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                      <SelectItem value="windows-1252">Windows-1252</SelectItem>
                      <SelectItem value="gbk">GBK</SelectItem>
                      <SelectItem value="big5">Big5</SelectItem>
                      <SelectItem value="euc-jp">EUC-JP</SelectItem>
                      <SelectItem value="shift-jis">Shift-JIS</SelectItem>
                      <SelectItem value="euc-kr">EUC-KR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Optional"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}
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
            
            {showSftpMore && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="private-key">Private Key</Label>
                  <Input
                    id="private-key"
                    type="file"
                    onChange={(e) => setPrivateKey(e.target.files?.[0] || null)}
                    accept=".pem,.key,.ppk"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Optional"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        );

      case 'smb':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="host">Host / Share Path</Label>
              <Input
                id="host"
                placeholder="192.168.1.52"
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
            
            {showSmbMore && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="smb-domain">Domain</Label>
                  <Input
                    id="smb-domain"
                    placeholder="Optional"
                    value={smbDomain}
                    onChange={(e) => setSmbDomain(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smb-version">Version</Label>
                  <Select value={smbVersion} onValueChange={setSmbVersion}>
                    <SelectTrigger id="smb-version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="smb1">SMB1</SelectItem>
                      <SelectItem value="smb2">SMB2</SelectItem>
                      <SelectItem value="smb3">SMB3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Optional"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        );

      case 'webdav':
        return (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label htmlFor="webdav-secure">Use HTTPS</Label>
                <Switch
                  id="webdav-secure"
                  checked={webdavSecure}
                  onCheckedChange={setWebdavSecure}
                />
              </div>
              {!webdavSecure && (
                <p className="text-xs text-warning px-3 animate-fade-in">⚠️ Not secure</p>
              )}
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
            
            {showWebdavMore && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Optional"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
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
                  setFormData(prev => ({ ...prev, protocol: 'smb' }));
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
                  <SelectItem value="ftp" className="text-foreground">FTP / FTPS</SelectItem>
                  <SelectItem value="sftp" className="text-foreground">SFTP (SSH File Transfer)</SelectItem>
                  <SelectItem value="smb" className="text-foreground">SMB (Windows Share)</SelectItem>
                  <SelectItem value="webdav" className="text-foreground">WebDAV</SelectItem>
                  <SelectItem value="local" className="text-foreground">Local Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderProtocolFields()}
          </div>

          {formData.protocol !== 'local' && (
            <DialogFooter className="sm:justify-between">
              <div>
                {(formData.protocol === 'ftp' || formData.protocol === 'ftps') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFtpMore(!showFtpMore)}
                  >
                    {showFtpMore ? 'Less' : 'More'}
                  </Button>
                )}
                {formData.protocol === 'sftp' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSftpMore(!showSftpMore)}
                  >
                    {showSftpMore ? 'Less' : 'More'}
                  </Button>
                )}
                {formData.protocol === 'smb' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSmbMore(!showSmbMore)}
                  >
                    {showSmbMore ? 'Less' : 'More'}
                  </Button>
                )}
                {formData.protocol === 'webdav' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWebdavMore(!showWebdavMore)}
                  >
                    {showWebdavMore ? 'Less' : 'More'}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
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
              </div>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};