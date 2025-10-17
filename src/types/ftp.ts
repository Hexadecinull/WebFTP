// Model Layer - Type Definitions

export interface FtpEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: string;
  permissions?: string;
}

export interface ConnectOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: 'ftp' | 'ftps' | 'sftp' | 'smb' | 'webdav' | 'local';
  sshKey?: string;
}

export interface Session {
  id: string;
  host: string;
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
  protocol: 'ftp' | 'ftps' | 'sftp' | 'smb' | 'webdav' | 'local';
  createdAt: Date;
}
