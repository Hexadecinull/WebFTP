# WebFTP Proxy Server

This is the backend proxy that lets WebFTP connect to real servers (FTP, FTPS, SFTP, SCP, SSH, WebDAV).

Browsers cannot open raw TCP sockets, so all protocol work runs here.

## Protocols

| Protocol | Library | Port |
|----------|---------|------|
| FTP | basic-ftp | 21 |
| FTPS | basic-ftp | 21 / 990 |
| SFTP | ssh2-sftp-client | 22 |
| SCP | ssh2-sftp-client | 22 |
| SSH | ssh2 | 22 |
| WebDAV | webdav | 80 / 443 |

SMB is not included by default. To add it: `npm install @marsaud/smb2` and uncomment the SMB section in `index.js`.

## Setup

```bash
cd server
npm install
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port to listen on |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin (set to your WebFTP domain in production) |

## Deploying

The proxy can run on any Node.js 18+ host. Recommended free/cheap options:

**Railway** — `railway up` in the `server/` directory  
**Render** — connect the repo, set root to `server/`, build command `npm install`, start `npm start`  
**Fly.io** — `fly launch` in `server/`  
**Any VPS** — install Node 18+, clone repo, `cd server && npm install && npm start`

## Configuring WebFTP

Once deployed, copy the public URL (e.g. `https://webftp-proxy.railway.app`) and paste it into:

> WebFTP → Settings → Connection → Proxy Server URL

WebFTP will use the proxy for all real server connections. If no proxy URL is set, it falls back to the in-memory demo filesystem.

## Security

- Set `ALLOWED_ORIGIN` to your WebFTP domain in production to prevent unauthorized use.
- The proxy holds active credentials in memory for the duration of each session.
- Use HTTPS for both the proxy and WebFTP in production.
- Sessions are cleaned up on disconnect; there is no persistence.
