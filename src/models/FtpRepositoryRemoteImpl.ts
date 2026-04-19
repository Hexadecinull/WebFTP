// Model Layer - Remote FTP Repository
//
// Talks to the WebFTP proxy server (server/) via REST + SSE.
// Used when a proxy URL is configured in Settings → Connection → Proxy Server URL.
// Falls back to FtpRepositoryImpl (in-memory VFS demo) when no proxy is set.

import { FtpEntry, ConnectOptions, Session } from '@/types/ftp';
import { FtpRepository, ProgressCallback } from '@/models/FtpRepository';

export class FtpRepositoryRemoteImpl implements FtpRepository {
  private baseUrl: string;
  private sessions: Map<string, ConnectOptions> = new Map();

  constructor(proxyUrl: string) {
    this.baseUrl = proxyUrl.replace(/\/$/, '');
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  async connect(options: ConnectOptions): Promise<Session> {
    const data = await this.request<{ sessionId: string; currentPath: string }>(
      'POST', '/api/connect', options
    );
    this.sessions.set(data.sessionId, options);
    return {
      id: data.sessionId,
      host: options.host,
      protocol: options.protocol,
      connected: true,
      currentPath: data.currentPath ?? '/',
    };
  }

  async list(session: Session, path: string): Promise<FtpEntry[]> {
    const data = await this.request<{ entries: FtpEntry[] }>(
      'POST', '/api/list', { sessionId: session.id, path }
    );
    return data.entries;
  }

  async download(
    session: Session,
    remotePath: string,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, remotePath }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Download failed');
    }

    const contentLength = res.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : undefined;

    if (onProgress && res.body) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress(loaded, total);
      }

      return new Blob(chunks);
    }

    return res.blob();
  }

  async upload(
    session: Session,
    remotePath: string,
    file: File,
    onProgress?: ProgressCallback
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/api/upload`);

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(e.loaded, e.total);
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `Upload failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      const formData = new FormData();
      formData.append('sessionId', session.id);
      formData.append('remotePath', remotePath);
      formData.append('file', file);

      // Remove Content-Type so browser sets multipart boundary automatically
      xhr.send(formData);
    });
  }

  async rename(session: Session, oldPath: string, newPath: string): Promise<void> {
    await this.request('POST', '/api/rename', { sessionId: session.id, oldPath, newPath });
  }

  async delete(session: Session, path: string): Promise<void> {
    await this.request('POST', '/api/delete', { sessionId: session.id, path });
  }

  async mkdir(session: Session, path: string): Promise<void> {
    await this.request('POST', '/api/mkdir', { sessionId: session.id, path });
  }

  async readFile(session: Session, path: string): Promise<string> {
    const blob = await this.download(session, path);
    return blob.text();
  }

  async writeFile(session: Session, path: string, content: string): Promise<void> {
    const file = new File([content], path.split('/').pop() || 'file.txt', { type: 'text/plain' });
    await this.upload(session, path, file);
  }

  async disconnect(session: Session): Promise<void> {
    await this.request('POST', '/api/disconnect', { sessionId: session.id }).catch(() => {});
    this.sessions.delete(session.id);
  }
}
