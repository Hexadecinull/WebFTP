// Model Layer - Type Definitions

export interface FtpEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: string;
  permissions?: string;
}

export type Protocol = 'ftp' | 'ftps' | 'sftp' | 'scp' | 'ssh' | 'smb' | 'webdav' | 'local';

export interface ConnectOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: Protocol;
  // SSH/SFTP/SCP key auth
  sshKey?: string;
  sshKeyPassphrase?: string;
  // FTP options
  ftpPassive?: boolean;
  ftpSecurityMode?: 'explicit' | 'implicit';
  ftpEncoding?: string;
  // SMB options
  smbDomain?: string;
  smbVersion?: 'automatic' | 'smb1' | 'smb2' | 'smb3';
  // WebDAV options
  webdavSecure?: boolean;
  webdavBasePath?: string;
  // General
  timeout?: number;
  keepAlive?: number;
  displayName?: string;
}

export interface Session {
  id: string;
  host: string;
  protocol: Protocol;
  connected: boolean;
  currentPath: string;
}

export interface Transfer {
  id: string;
  type: 'upload' | 'download';
  fileName: string;
  localPath: string;
  remotePath: string;
  progress: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
  error?: string;
  size?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Bookmark {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  protocol: Protocol;
  createdAt: Date;
}
