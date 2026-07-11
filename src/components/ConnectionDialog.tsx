// View Layer - Connection Dialog Component

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConnectOptions, Protocol } from '@/types/ftp';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, ChevronDown, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (options: ConnectOptions) => void;
  onSave?: (options: ConnectOptions) => void;
  isConnecting: boolean;
  prefill?: Partial<ConnectOptions>;
}

const DEFAULT_PORTS: Record<Protocol, number> = {
  ftp: 21,
  ftps: 990,
  sftp: 22,
  scp: 22,
  ssh: 22,
  smb: 445,
  webdav: 443,
  local: 0,
};

export const ConnectionDialog = ({
  open,
  onOpenChange,
  onConnect,
  onSave,
  isConnecting,
  prefill,
}: ConnectionDialogProps) => {
  const [formData, setFormData] = useState<ConnectOptions>({
    host: '',
    port: 21,
    username: '',
    password: '',
    protocol: 'ftp',
  });
  const [ftpSecure, setFtpSecure] = useState(true);
  const [webdavSecure, setWebdavSecure] = useState(true);
  const [showFtpMore, setShowFtpMore] = useState(false);
  const [showSftpMore, setShowSftpMore] = useState(false);
  const [showSmbMore, setShowSmbMore] = useState(false);
  const [showWebdavMore, setShowWebdavMore] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const { user } = useAuth();

  // Update port when protocol changes
  useEffect(() => {
    if (formData.protocol === 'ftp') {
      setFormData(prev => ({ ...prev, port: ftpSecure ? 21 : 21 }));
    } else if (formData.protocol === 'webdav') {
      setFormData(prev => ({ ...prev, port: webdavSecure ? 443 : 80, webdavSecure }));
    } else {
      setFormData(prev => ({ ...prev, port: DEFAULT_PORTS[formData.protocol] }));
    }
  }, [formData.protocol, webdavSecure, ftpSecure]);

  // Collapse expanded sections on protocol switch
  useEffect(() => {
    setShowFtpMore(false);
    setShowSftpMore(false);
    setShowSmbMore(false);
    setShowWebdavMore(false);
    setKeyFile(null);
  }, [formData.protocol]);

  // Reset on open, applying any prefill from recent connections
  useEffect(() => {
    if (open) {
      setFormData({
        host: prefill?.host ?? '',
        port: prefill?.port ?? 21,
        username: prefill?.username ?? '',
        password: '',
        protocol: prefill?.protocol ?? 'ftp',
      });
      setShowPassword(false);
      setShowFtpMore(false);
      setShowSftpMore(false);
      setShowSmbMore(false);
      setShowWebdavMore(false);
      setKeyFile(null);
    }
  }, [open]);

  const handleKeyFile = async (file: File | null) => {
    setKeyFile(file);
    if (file) {
      const text = await file.text();
      setFormData(prev => ({ ...prev, sshKey: text }));
    } else {
      setFormData(prev => ({ ...prev, sshKey: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  // Shared host + port + credentials fields
  const hostField = (placeholder: string) => (
    <div className="grid gap-2">
      <Label htmlFor="host">Host</Label>
      <Input
        id="host"
        placeholder={placeholder}
        value={formData.host}
        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
        required
      />
    </div>
  );

  const portField = () => (
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
  );

  const credentialFields = (userPlaceholder = 'username') => (
    <>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder={userPlaceholder}
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className={formData.password ? 'pr-10' : ''}
          />
          {formData.password && (
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </>
  );

  const sshKeyFields = () => (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="private-key">Private Key File <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="private-key"
          type="file"
          onChange={(e) => handleKeyFile(e.target.files?.[0] || null)}
          accept=".pem,.key,.ppk,id_rsa,id_ed25519,id_ecdsa"
        />
        {keyFile && <p className="text-xs text-muted-foreground">Loaded: {keyFile.name}</p>}
      </div>
      {formData.sshKey && (
        <div className="grid gap-2">
          <Label htmlFor="key-passphrase">Key Passphrase <span className="text-muted-foreground font-normal">(if encrypted)</span></Label>
          <Input
            id="key-passphrase"
            type="password"
            placeholder="Leave blank if none"
            value={formData.sshKeyPassphrase || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sshKeyPassphrase: e.target.value }))}
          />
        </div>
      )}
    </div>
  );

  const displayNameField = () => (
    <div className="grid gap-2">
      <Label htmlFor="display-name">Display Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
      <Input
        id="display-name"
        placeholder="My Server"
        value={formData.displayName || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
      />
    </div>
  );

  const renderProtocolFields = () => {
    switch (formData.protocol) {
      case 'ftp':
        return (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <Label htmlFor="ftp-secure">Use FTPS (encrypted)</Label>
                <Switch id="ftp-secure" checked={ftpSecure} onCheckedChange={setFtpSecure} />
              </div>
              {!ftpSecure && <p className="text-xs text-warning px-3 animate-fade-in">⚠️ Plain FTP — credentials sent unencrypted</p>}
            </div>
            {hostField('ftp.example.com')}
            {portField()}
            {credentialFields('anonymous')}
            {showFtpMore && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="ftp-mode">Transfer Mode</Label>
                  <Select value={formData.ftpPassive !== false ? 'passive' : 'active'} onValueChange={v => setFormData(prev => ({ ...prev, ftpPassive: v === 'passive' }))}>
                    <SelectTrigger id="ftp-mode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passive">Passive (recommended)</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ftpSecure && (
                  <div className="grid gap-2">
                    <Label htmlFor="ftp-security-mode">TLS Mode</Label>
                    <Select value={formData.ftpSecurityMode || 'explicit'} onValueChange={v => setFormData(prev => ({ ...prev, ftpSecurityMode: v as 'explicit' | 'implicit' }))}>
                      <SelectTrigger id="ftp-security-mode"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="explicit">Explicit (STARTTLS)</SelectItem>
                        <SelectItem value="implicit">Implicit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="ftp-encoding">Encoding</Label>
                  <Select value={formData.ftpEncoding || 'automatic'} onValueChange={v => setFormData(prev => ({ ...prev, ftpEncoding: v }))}>
                    <SelectTrigger id="ftp-encoding"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
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
                {displayNameField()}
              </div>
            )}
          </>
        );

      case 'sftp':
        return (
          <>
            {hostField('sftp.example.com')}
            {portField()}
            {credentialFields()}
            {showSftpMore && (
              <div className="space-y-3 animate-fade-in">
                {sshKeyFields()}
                {displayNameField()}
              </div>
            )}
          </>
        );

      case 'scp':
        return (
          <>
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              SCP transfers files over SSH. Uses the same credentials as SFTP.
            </p>
            {hostField('server.example.com')}
            {portField()}
            {credentialFields()}
            {showSftpMore && (
              <div className="space-y-3 animate-fade-in">
                {sshKeyFields()}
                {displayNameField()}
              </div>
            )}
          </>
        );

      case 'ssh':
        return (
          <>
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              SSH connects directly to a shell. File browsing uses the SFTP subsystem internally.
            </p>
            {hostField('server.example.com')}
            {portField()}
            {credentialFields()}
            {showSftpMore && (
              <div className="space-y-3 animate-fade-in">
                {sshKeyFields()}
                {displayNameField()}
              </div>
            )}
          </>
        );

      case 'smb':
        return (
          <>
            {hostField('192.168.1.100')}
            <div className="grid gap-2">
              <Label htmlFor="smb-share">Share Name</Label>
              <Input
                id="smb-share"
                placeholder="shared"
                value={formData.displayName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            {credentialFields()}
            {showSmbMore && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="smb-domain">Domain <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="smb-domain"
                    placeholder="WORKGROUP"
                    value={formData.smbDomain || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, smbDomain: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smb-version">SMB Version</Label>
                  <Select value={formData.smbVersion || 'automatic'} onValueChange={v => setFormData(prev => ({ ...prev, smbVersion: v as ConnectOptions['smbVersion'] }))}>
                    <SelectTrigger id="smb-version"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="smb1">SMB 1</SelectItem>
                      <SelectItem value="smb2">SMB 2</SelectItem>
                      <SelectItem value="smb3">SMB 3</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Switch id="webdav-secure" checked={webdavSecure} onCheckedChange={setWebdavSecure} />
              </div>
              {!webdavSecure && <p className="text-xs text-warning px-3 animate-fade-in">⚠️ HTTP — connection is not encrypted</p>}
            </div>
            {hostField('dav.example.com')}
            {portField()}
            {credentialFields()}
            {showWebdavMore && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="webdav-path">Base Path <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="webdav-path"
                    placeholder="/remote.php/dav/files/username/"
                    value={formData.webdavBasePath || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, webdavBasePath: e.target.value }))}
                  />
                </div>
                {displayNameField()}
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
                <div className="h-2 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-2 bg-muted rounded w-1/2 mx-auto" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">No local networks found?</p>
              <Button type="button" variant="outline" onClick={() => setFormData(prev => ({ ...prev, protocol: 'smb', port: 445 }))}>
                Manual SMB Input
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasMoreButton = (protocol: Protocol) =>
    ['ftp', 'sftp', 'scp', 'ssh', 'smb', 'webdav'].includes(protocol);

  const moreOpen = formData.protocol === 'ftp' ? showFtpMore
    : ['sftp', 'scp', 'ssh'].includes(formData.protocol) ? showSftpMore
    : formData.protocol === 'smb' ? showSmbMore
    : showWebdavMore;

  const toggleMore = () => {
    if (!user) return;
    if (formData.protocol === 'ftp') setShowFtpMore(v => !v);
    else if (['sftp', 'scp', 'ssh'].includes(formData.protocol)) setShowSftpMore(v => !v);
    else if (formData.protocol === 'smb') setShowSmbMore(v => !v);
    else setShowWebdavMore(v => !v);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to Server</DialogTitle>
          <DialogDescription>Choose a protocol and enter connection details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select
                value={formData.protocol}
                onValueChange={(value: Protocol) => setFormData(prev => ({ ...prev, protocol: value }))}
              >
                <SelectTrigger id="protocol"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ftp">FTP / FTPS</SelectItem>
                  <SelectItem value="sftp">SFTP — SSH File Transfer</SelectItem>
                  <SelectItem value="scp">SCP — Secure Copy</SelectItem>
                  <SelectItem value="ssh">SSH — Secure Shell</SelectItem>
                  <SelectItem value="smb">SMB — Windows Share</SelectItem>
                  <SelectItem value="webdav">WebDAV</SelectItem>
                  <SelectItem value="local">Local Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderProtocolFields()}
          </div>

          {formData.protocol !== 'local' && (
            <DialogFooter className="sm:justify-between">
              <div>
                {hasMoreButton(formData.protocol) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!user) {
                        toast({ title: 'Sign in required', description: 'Create an account or sign in to access advanced connection options.' });
                        return;
                      }
                      toggleMore();
                    }}
                  >
                    {!user && <Lock className="h-3 w-3 mr-1" />}
                    More
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isConnecting}>
                  Cancel
                </Button>
                {onSave && (
                  <Button
                    type="button"
                    onClick={() => onSave(formData)}
                    disabled={!formData.host || isConnecting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                )}
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
