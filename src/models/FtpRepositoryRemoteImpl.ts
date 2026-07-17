// Model Layer - Remote FTP Repository
//
// Talks to the WebFTP proxy server (server/) via REST + SSE.
// Used when a proxy URL is configured in Settings → Connection → Proxy Server URL.
// Falls back to FtpRepositoryImpl (in-memory VFS demo) when no proxy is set.
//
// Every operation logs to the shared console (src/lib/consoleLog.ts) so the
// Console panel can show a live, color-coded feed of server interactions.

import { FtpEntry, ConnectOptions, Session } from '@/types/ftp';
import { FtpRepository, ProgressCallback } from '@/models/FtpRepository';
import { logEvent } from '@/lib/consoleLog';

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
    logEvent('request', `Connecting to ${options.host}:${options.port} via ${options.protocol.toUpperCase()}…`);
    try {
      const data = await this.request<{ sessionId: string; currentPath: string }>(
        'POST', '/api/connect', options
      );
      this.sessions.set(data.sessionId, options);
      logEvent('success', `Connected to ${options.host} (session ${data.sessionId.slice(0, 8)})`);
      return {
        id: data.sessionId,
        host: options.host,
        protocol: options.protocol,
        connected: true,
        currentPath: data.currentPath ?? '/',
      };
    } catch (err) {
      logEvent('error', `Connection to ${options.host} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async list(session: Session, path: string): Promise<FtpEntry[]> {
    logEvent('request', `LIST ${path}`);
    try {
      const data = await this.request<{ entries: FtpEntry[] }>(
        'POST', '/api/list', { sessionId: session.id, path }
      );
      logEvent('info', `Listed ${data.entries.length} item(s) in ${path}`);
      return data.entries;
    } catch (err) {
      logEvent('error', `Failed to list ${path}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async search(session: Session, path: string, query: string): Promise<FtpEntry[]> {
    logEvent('request', `Searching for "${query}" in ${path} and subdirectories…`);
    try {
      const data = await this.request<{ entries: FtpEntry[]; truncated: boolean }>(
        'POST', '/api/search', { sessionId: session.id, path, query }
      );
      logEvent('info', `Search found ${data.entries.length} match(es)${data.truncated ? ' (truncated)' : ''}`);
      return data.entries;
    } catch (err) {
      logEvent('error', `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async download(
    session: Session,
    remotePath: string,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    logEvent('request', `RETR ${remotePath}`);
    try {
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

      let blob: Blob;
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

        blob = new Blob(chunks);
      } else {
        blob = await res.blob();
      }

      logEvent('success', `Downloaded ${remotePath} (${blob.size} bytes)`);
      return blob;
    } catch (err) {
      logEvent('error', `Failed to download ${remotePath}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async upload(
    session: Session,
    remotePath: string,
    file: File,
    onProgress?: ProgressCallback
  ): Promise<void> {
    logEvent('request', `STOR ${remotePath} (${file.size} bytes)`);
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
          logEvent('success', `Uploaded ${remotePath}`);
          resolve();
        } else {
          let message = `Upload failed: ${xhr.status}`;
          try {
            const err = JSON.parse(xhr.responseText);
            message = err.message || message;
          } catch { /* use default message */ }
          logEvent('error', message);
          reject(new Error(message));
        }
      };

      xhr.onerror = () => {
        logEvent('error', `Network error while uploading ${remotePath}`);
        reject(new Error('Network error during upload'));
      };

      const formData = new FormData();
      formData.append('sessionId', session.id);
      formData.append('remotePath', remotePath);
      formData.append('file', file);

      // Remove Content-Type so browser sets multipart boundary automatically
      xhr.send(formData);
    });
  }

  async rename(session: Session, oldPath: string, newPath: string): Promise<void> {
    logEvent('request', `RENAME ${oldPath} → ${newPath}`);
    try {
      await this.request('POST', '/api/rename', { sessionId: session.id, oldPath, newPath });
      logEvent('success', `Renamed/moved ${oldPath} → ${newPath}`);
    } catch (err) {
      logEvent('error', `Failed to rename ${oldPath}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async delete(session: Session, path: string): Promise<void> {
    logEvent('request', `DELETE ${path}`);
    try {
      await this.request('POST', '/api/delete', { sessionId: session.id, path });
      logEvent('success', `Deleted ${path}`);
    } catch (err) {
      logEvent('error', `Failed to delete ${path}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  async mkdir(session: Session, path: string): Promise<void> {
    logEvent('request', `MKDIR ${path}`);
    try {
      await this.request('POST', '/api/mkdir', { sessionId: session.id, path });
      logEvent('success', `Created folder ${path}`);
    } catch (err) {
      logEvent('error', `Failed to create folder ${path}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
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
    logEvent('info', `Disconnecting from ${session.host}…`);
    await this.request('POST', '/api/disconnect', { sessionId: session.id }).catch(() => {});
    this.sessions.delete(session.id);
    logEvent('warning', `Disconnected from ${session.host}`);
  }
}
