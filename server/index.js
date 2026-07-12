/**
 * WebFTP Proxy Server
 *
 * Bridges the browser-based frontend to real network protocols.
 * The browser cannot open raw TCP sockets, so all protocol work happens here.
 *
 * Running at: https://webftp.ssmg4.dpdns.org (proxied via Nginx /api/)
 *
 * Configure via server/.env:
 *   PORT=3001
 *   ALLOWED_ORIGIN=https://webftp.ssmg4.dpdns.org
 * Supported protocols:
 *   FTP / FTPS  — via basic-ftp
 *   SFTP        — via ssh2-sftp-client
 *   SCP         — via ssh2 (file transfer over SSH)
 *   SSH         — via ssh2 (exec channel for shell commands)
 *   WebDAV      — via webdav client (HTTP-based, can also run client-side)
 *
 * Deployment: run on any VPS, Railway, Render, or Fly.io.
 * Set the public URL in WebFTP → Settings → Connection → Proxy Server URL.
 *
 * Environment variables:
 *   PORT          — server port (default 3001)
 *   ALLOWED_ORIGIN — CORS origin to allow (default http://localhost:8080)
 *
 * SMB note: @marsaud/smb2 is not included by default due to native dependencies.
 * If you need SMB, run: npm install @marsaud/smb2
 * and uncomment the SMB section below.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Client as FtpClient } from 'basic-ftp';
import SftpClient from 'ssh2-sftp-client';
import { Client as SshClient } from 'ssh2';
import { createClient as createWebDavClient } from 'webdav';
import { Readable } from 'stream';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(express.json());

// In-memory session store
const sessions = new Map();

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found or expired');
  return session;
}

function makeSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Connect ────────────────────────────────────────────────────────────────

app.post('/api/connect', async (req, res) => {
  const opts = req.body;
  const sessionId = makeSessionId();

  try {
    if (opts.protocol === 'ftp' || opts.protocol === 'ftps') {
      const client = new FtpClient();
      client.ftp.verbose = opts.enableLogging ?? false;
      await client.access({
        host: opts.host,
        port: opts.port ?? 21,
        user: opts.username,
        password: opts.password,
        secure: opts.protocol === 'ftps',
        secureOptions: opts.ftpSecurityMode === 'implicit' ? { rejectUnauthorized: false } : undefined,
        timeout: (opts.timeout ?? 30) * 1000,
      });
      if (opts.ftpPassive === false) client.ftp.passive = false;
      sessions.set(sessionId, { type: 'ftp', client, opts });
      return res.json({ sessionId, currentPath: '/' });
    }

    if (opts.protocol === 'sftp' || opts.protocol === 'scp') {
      const client = new SftpClient();
      const connectOpts = {
        host: opts.host,
        port: opts.port ?? 22,
        username: opts.username,
        readyTimeout: (opts.timeout ?? 30) * 1000,
        keepaliveInterval: (opts.keepAlive ?? 60) * 1000,
        ...(opts.sshKey
          ? { privateKey: opts.sshKey, passphrase: opts.sshKeyPassphrase }
          : { password: opts.password }),
      };
      await client.connect(connectOpts);
      sessions.set(sessionId, { type: 'sftp', client, opts });
      return res.json({ sessionId, currentPath: '/' });
    }

    if (opts.protocol === 'ssh') {
      // SSH shell session — store credentials, verify connection, return session
      await new Promise((resolve, reject) => {
        const conn = new SshClient();
        conn.on('ready', () => {
          sessions.set(sessionId, { type: 'ssh', client: conn, opts });
          resolve(null);
        });
        conn.on('error', reject);
        conn.connect({
          host: opts.host,
          port: opts.port ?? 22,
          username: opts.username,
          readyTimeout: (opts.timeout ?? 30) * 1000,
          ...(opts.sshKey
            ? { privateKey: opts.sshKey, passphrase: opts.sshKeyPassphrase }
            : { password: opts.password }),
        });
      });
      return res.json({ sessionId, currentPath: '/' });
    }

    if (opts.protocol === 'webdav') {
      const scheme = opts.webdavSecure !== false ? 'https' : 'http';
      const basePath = opts.webdavBasePath || '/';
      const url = `${scheme}://${opts.host}:${opts.port}${basePath}`;
      const client = createWebDavClient(url, {
        username: opts.username,
        password: opts.password,
      });
      // Verify connection by listing root
      await client.getDirectoryContents('/');
      sessions.set(sessionId, { type: 'webdav', client, opts });
      return res.json({ sessionId, currentPath: '/' });
    }

    res.status(400).json({ message: `Unsupported protocol: ${opts.protocol}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── List ────────────────────────────────────────────────────────────────────

app.post('/api/list', async (req, res) => {
  const { sessionId, path } = req.body;
  try {
    const session = getSession(sessionId);

    if (session.type === 'ftp') {
      const list = await session.client.list(path || '/');
      const entries = list.map(f => ({
        name: f.name,
        path: `${path}/${f.name}`.replace('//', '/'),
        isDirectory: f.isDirectory,
        size: f.size,
        modifiedAt: f.modifiedAt?.toISOString(),
        permissions: f.permissions ? `${f.permissions.user.read ? 'r' : '-'}${f.permissions.user.write ? 'w' : '-'}${f.permissions.user.execute ? 'x' : '-'}` : undefined,
      }));
      return res.json({ entries });
    }

    if (session.type === 'sftp' || session.type === 'scp') {
      const list = await session.client.list(path || '/');
      const entries = list.map(f => ({
        name: f.name,
        path: `${path}/${f.name}`.replace('//', '/'),
        isDirectory: f.type === 'd',
        size: f.size,
        modifiedAt: new Date(f.modifyTime).toISOString(),
        permissions: f.rights ? `${f.rights.user}${f.rights.group}${f.rights.other}` : undefined,
      }));
      return res.json({ entries });
    }

    if (session.type === 'webdav') {
      const list = await session.client.getDirectoryContents(path || '/');
      const entries = Array.isArray(list) ? list.map(f => ({
        name: f.basename,
        path: f.filename,
        isDirectory: f.type === 'directory',
        size: f.size,
        modifiedAt: f.lastmod,
      })) : [];
      return res.json({ entries });
    }

    if (session.type === 'ssh') {
      // SSH: use sftp subsystem for directory listing
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      const list = await new Promise((resolve, reject) => {
        sftp.readdir(path || '/', (err, l) => err ? reject(err) : resolve(l));
      });
      const entries = list.map(f => ({
        name: f.filename,
        path: `${path}/${f.filename}`.replace('//', '/'),
        isDirectory: (f.attrs.mode & 0o040000) !== 0,
        size: f.attrs.size,
        modifiedAt: new Date(f.attrs.mtime * 1000).toISOString(),
      }));
      return res.json({ entries });
    }

    res.status(400).json({ message: 'Unknown session type' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Download ────────────────────────────────────────────────────────────────

app.post('/api/download', async (req, res) => {
  const { sessionId, remotePath } = req.body;
  try {
    const session = getSession(sessionId);
    const filename = remotePath.split('/').pop() || 'download';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    if (session.type === 'ftp') {
      const { PassThrough } = await import('stream');
      const pass = new PassThrough();
      pass.pipe(res);
      await session.client.downloadTo(pass, remotePath);
      return;
    }

    if (session.type === 'sftp' || session.type === 'scp') {
      const stream = await session.client.createReadStream(remotePath);
      stream.pipe(res);
      return;
    }

    if (session.type === 'webdav') {
      const stream = session.client.createReadStream(remotePath);
      stream.pipe(res);
      return;
    }

    if (session.type === 'ssh') {
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      const stream = sftp.createReadStream(remotePath);
      stream.pipe(res);
      return;
    }

    res.status(400).json({ message: 'Unknown session type' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Upload ──────────────────────────────────────────────────────────────────

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { sessionId, remotePath } = req.body;
  try {
    const session = getSession(sessionId);
    const buffer = req.file.buffer;
    const readable = Readable.from(buffer);

    if (session.type === 'ftp') {
      await session.client.uploadFrom(readable, remotePath);
      return res.json({ ok: true });
    }

    if (session.type === 'sftp' || session.type === 'scp') {
      await session.client.put(buffer, remotePath);
      return res.json({ ok: true });
    }

    if (session.type === 'webdav') {
      await session.client.putFileContents(remotePath, buffer);
      return res.json({ ok: true });
    }

    if (session.type === 'ssh') {
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      await new Promise((resolve, reject) => {
        const ws = sftp.createWriteStream(remotePath);
        ws.on('finish', resolve);
        ws.on('error', reject);
        readable.pipe(ws);
      });
      return res.json({ ok: true });
    }

    res.status(400).json({ message: 'Unknown session type' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Rename ──────────────────────────────────────────────────────────────────

app.post('/api/rename', async (req, res) => {
  const { sessionId, oldPath, newPath } = req.body;
  try {
    const session = getSession(sessionId);

    if (session.type === 'ftp') {
      await session.client.rename(oldPath, newPath);
    } else if (session.type === 'sftp' || session.type === 'scp') {
      await session.client.rename(oldPath, newPath);
    } else if (session.type === 'webdav') {
      await session.client.moveFile(oldPath, newPath);
    } else if (session.type === 'ssh') {
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      await new Promise((resolve, reject) => {
        sftp.rename(oldPath, newPath, err => err ? reject(err) : resolve(null));
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete ──────────────────────────────────────────────────────────────────

app.post('/api/delete', async (req, res) => {
  const { sessionId, path } = req.body;
  try {
    const session = getSession(sessionId);

    if (session.type === 'ftp') {
      try { await session.client.remove(path); }
      catch { await session.client.removeDir(path); }
    } else if (session.type === 'sftp' || session.type === 'scp') {
      const stat = await session.client.stat(path);
      if (stat.isDirectory) await session.client.rmdir(path, true);
      else await session.client.delete(path);
    } else if (session.type === 'webdav') {
      await session.client.deleteFile(path);
    } else if (session.type === 'ssh') {
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      await new Promise((resolve, reject) => {
        sftp.unlink(path, err => err ? reject(err) : resolve(null));
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Mkdir ───────────────────────────────────────────────────────────────────

app.post('/api/mkdir', async (req, res) => {
  const { sessionId, path } = req.body;
  try {
    const session = getSession(sessionId);

    if (session.type === 'ftp') {
      await session.client.ensureDir(path);
    } else if (session.type === 'sftp' || session.type === 'scp') {
      await session.client.mkdir(path, true);
    } else if (session.type === 'webdav') {
      await session.client.createDirectory(path);
    } else if (session.type === 'ssh') {
      const sftp = await new Promise((resolve, reject) => {
        session.client.sftp((err, s) => err ? reject(err) : resolve(s));
      });
      await new Promise((resolve, reject) => {
        sftp.mkdir(path, err => err ? reject(err) : resolve(null));
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Disconnect ───────────────────────────────────────────────────────────────

app.post('/api/disconnect', async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = sessions.get(sessionId);
    if (session) {
      if (session.type === 'ftp') session.client.close();
      else if (session.type === 'sftp' || session.type === 'scp') await session.client.end();
      else if (session.type === 'ssh') session.client.end();
      sessions.delete(sessionId);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── SSH Exec (for SSH terminal protocol) ────────────────────────────────────

app.post('/api/exec', async (req, res) => {
  const { sessionId, command } = req.body;
  try {
    const session = getSession(sessionId);
    if (session.type !== 'ssh') return res.status(400).json({ message: 'Session is not SSH' });

    const output = await new Promise((resolve, reject) => {
      session.client.exec(command, (err, stream) => {
        if (err) return reject(err);
        let stdout = '';
        let stderr = '';
        stream.on('data', d => { stdout += d.toString(); });
        stream.stderr.on('data', d => { stderr += d.toString(); });
        stream.on('close', () => resolve({ stdout, stderr }));
      });
    });

    res.json(output);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Archive ─────────────────────────────────────────────────────────────────

import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const archiver = _require('archiver');
import StreamZip from 'node-stream-zip';

const ARCHIVE_MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB uncompressed limit
const ARCHIVE_MAX_RATIO = 100;                    // zip bomb: >100:1 ratio is rejected
const ARCHIVE_EXTENSIONS = ['.zip', '.tar', '.tar.gz', '.tgz', '.gz'];

function isArchive(filename) {
  const lower = filename.toLowerCase();
  return ARCHIVE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

// List archive contents
app.post('/api/archive/list', async (req, res) => {
  const { sessionId, remotePath } = req.body;
  try {
    const session = getSession(sessionId);
    const filename = remotePath.toLowerCase();

    // Download archive to a temp buffer first
    const chunks = [];
    if (session.type === 'ftp') {
      const { PassThrough } = await import('stream');
      const pass = new PassThrough();
      pass.on('data', c => chunks.push(c));
      await new Promise((resolve, reject) => {
        pass.on('end', resolve);
        pass.on('error', reject);
        session.client.downloadTo(pass, remotePath);
      });
    } else if (session.type === 'sftp' || session.type === 'scp') {
      const stream = await session.client.createReadStream(remotePath);
      await new Promise((resolve, reject) => {
        stream.on('data', c => chunks.push(c));
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } else {
      return res.status(400).json({ message: 'Archive listing not supported for this protocol' });
    }

    const buffer = Buffer.concat(chunks);

    // ZIP handling
    if (filename.endsWith('.zip')) {
      const tmp = `/tmp/webftp_${Date.now()}.zip`;
      await import('fs/promises').then(fs => fs.writeFile(tmp, buffer));

      const zip = new StreamZip.async({ file: tmp });
      const entries = await zip.entries();
      await zip.close();
      await import('fs/promises').then(fs => fs.unlink(tmp));

      let totalUncompressed = 0;
      const files = Object.values(entries).map(e => {
        totalUncompressed += e.size;
        return {
          name: e.name,
          size: e.size,
          compressedSize: e.compressedSize,
          isDirectory: e.isDirectory,
        };
      });

      if (totalUncompressed > ARCHIVE_MAX_SIZE) {
        return res.status(400).json({ message: `Archive uncompressed size exceeds 2 GB limit` });
      }
      const ratio = buffer.length > 0 ? totalUncompressed / buffer.length : 0;
      if (ratio > ARCHIVE_MAX_RATIO) {
        return res.status(400).json({ message: `Suspicious compression ratio (${ratio.toFixed(0)}:1) — possible zip bomb` });
      }

      return res.json({ entries: files });
    }

    res.status(400).json({ message: 'Only ZIP archives support content listing currently' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Extract a single file from a ZIP archive
app.post('/api/archive/extract', async (req, res) => {
  const { sessionId, remotePath, entryName } = req.body;
  try {
    const session = getSession(sessionId);

    // Download archive
    const chunks = [];
    if (session.type === 'ftp') {
      const { PassThrough } = await import('stream');
      const pass = new PassThrough();
      pass.on('data', c => chunks.push(c));
      await new Promise((resolve, reject) => {
        pass.on('end', resolve); pass.on('error', reject);
        session.client.downloadTo(pass, remotePath);
      });
    } else if (session.type === 'sftp' || session.type === 'scp') {
      const stream = await session.client.createReadStream(remotePath);
      await new Promise((resolve, reject) => {
        stream.on('data', c => chunks.push(c));
        stream.on('end', resolve); stream.on('error', reject);
      });
    } else {
      return res.status(400).json({ message: 'Protocol not supported for archive extraction' });
    }

    const buffer = Buffer.concat(chunks);
    const tmp = `/tmp/webftp_${Date.now()}.zip`;
    await import('fs/promises').then(fs => fs.writeFile(tmp, buffer));

    const zip = new StreamZip.async({ file: tmp });
    const entry = await zip.entry(entryName);
    if (!entry) { await zip.close(); return res.status(404).json({ message: 'Entry not found in archive' }); }

    if (entry.size > ARCHIVE_MAX_SIZE) {
      await zip.close();
      return res.status(400).json({ message: 'File exceeds 2 GB extraction limit' });
    }

    const fileBuffer = await zip.entryData(entryName);
    await zip.close();
    await import('fs/promises').then(fs => fs.unlink(tmp));

    const basename = entryName.split('/').pop() || entryName;
    res.setHeader('Content-Disposition', `attachment; filename="${basename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(fileBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a ZIP archive of multiple remote files
app.post('/api/archive/create', async (req, res) => {
  const { sessionId, paths, archiveName = 'archive.zip' } = req.body;
  if (!Array.isArray(paths) || paths.length === 0) {
    return res.status(400).json({ message: 'No paths provided' });
  }
  try {
    const session = getSession(sessionId);
    res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    for (const remotePath of paths) {
      const chunks = [];
      if (session.type === 'ftp') {
        const { PassThrough } = await import('stream');
        const pass = new PassThrough();
        pass.on('data', c => chunks.push(c));
        await new Promise((resolve, reject) => {
          pass.on('end', resolve); pass.on('error', reject);
          session.client.downloadTo(pass, remotePath);
        });
      } else if (session.type === 'sftp' || session.type === 'scp') {
        const stream = await session.client.createReadStream(remotePath);
        await new Promise((resolve, reject) => {
          stream.on('data', c => chunks.push(c));
          stream.on('end', resolve); stream.on('error', reject);
        });
      }
      const name = remotePath.split('/').pop() || 'file';
      archive.append(Buffer.concat(chunks), { name });
    }

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WebFTP proxy server running on port ${PORT}`);
  console.log(`Allowed origin: ${process.env.ALLOWED_ORIGIN || '*'}`);
});
