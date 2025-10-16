// Model Layer - FTP Repository

import { FtpEntry, ConnectOptions, Session } from '@/types/ftp';

export type ProgressCallback = (loaded: number, total?: number) => void;

export interface FtpRepository {
  connect(options: ConnectOptions): Promise<Session>;
  list(session: Session, path: string): Promise<FtpEntry[]>;
  download(session: Session, remotePath: string, onProgress?: ProgressCallback): Promise<Blob>;
  upload(session: Session, remotePath: string, file: File, onProgress?: ProgressCallback): Promise<void>;
  rename(session: Session, oldPath: string, newPath: string): Promise<void>;
  delete(session: Session, path: string): Promise<void>;
  mkdir(session: Session, path: string): Promise<void>;
  readFile(session: Session, path: string): Promise<string>;
  writeFile(session: Session, path: string, content: string): Promise<void>;
  disconnect(session: Session): Promise<void>;
}

// Mock implementation for now - will be replaced with actual backend calls
export class FtpRepositoryImpl implements FtpRepository {
  private sessions: Map<string, Session> = new Map();

  async connect(options: ConnectOptions): Promise<Session> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const session: Session = {
      id: Math.random().toString(36).substring(7),
      host: options.host,
      connected: true,
      currentPath: '/',
    };
    
    this.sessions.set(session.id, session);
    return session;
  }

  async list(session: Session, path: string): Promise<FtpEntry[]> {
    // Mock file list
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        name: '..',
        path: path === '/' ? '/' : path.split('/').slice(0, -1).join('/') || '/',
        isDirectory: true,
      },
      {
        name: 'documents',
        path: `${path}/documents`,
        isDirectory: true,
        modifiedAt: new Date().toISOString(),
      },
      {
        name: 'images',
        path: `${path}/images`,
        isDirectory: true,
        modifiedAt: new Date().toISOString(),
      },
      {
        name: 'readme.txt',
        path: `${path}/readme.txt`,
        isDirectory: false,
        size: 1024,
        modifiedAt: new Date().toISOString(),
        permissions: 'rw-r--r--',
      },
      {
        name: 'config.json',
        path: `${path}/config.json`,
        isDirectory: false,
        size: 512,
        modifiedAt: new Date().toISOString(),
        permissions: 'rw-r--r--',
      },
    ];
  }

  async download(session: Session, remotePath: string, onProgress?: ProgressCallback): Promise<Blob> {
    // Simulate download with progress
    const content = await this.readFile(session, remotePath);
    const totalSize = content.length;
    const chunks = 20;
    const chunkSize = totalSize / chunks;
    
    for (let i = 0; i <= chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress?.(i * chunkSize, totalSize);
    }
    
    return new Blob([content], { type: 'application/octet-stream' });
  }

  async upload(session: Session, remotePath: string, file: File, onProgress?: ProgressCallback): Promise<void> {
    // Simulate upload with progress
    const totalSize = file.size;
    const chunks = 20;
    const chunkSize = totalSize / chunks;
    
    for (let i = 0; i <= chunks; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress?.(i * chunkSize, totalSize);
    }
  }

  async rename(session: Session, oldPath: string, newPath: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async delete(session: Session, path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async mkdir(session: Session, path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async readFile(session: Session, path: string): Promise<string> {
    console.log('Reading file:', path);
    // Mock implementation - return sample content
    await new Promise(resolve => setTimeout(resolve, 500));
    return `# Sample File Content\n\nThis is a mock file content for: ${path}\n\nIn a real implementation, this would fetch the actual file content from the FTP server.`;
  }

  async writeFile(session: Session, path: string, content: string): Promise<void> {
    console.log('Writing file:', path);
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async disconnect(session: Session): Promise<void> {
    this.sessions.delete(session.id);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}
