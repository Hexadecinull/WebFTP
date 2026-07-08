# WebFTP Proxy Server

This is the backend proxy that bridges the browser frontend to real network protocols. Since browsers cannot open raw TCP sockets, all protocol work (FTP, SFTP, SSH, etc.) runs here on the server.

## Protocols

| Protocol | Library | Default Port |
|----------|---------|-------------|
| FTP | basic-ftp | 21 |
| FTPS | basic-ftp | 21 / 990 |
| SFTP | ssh2-sftp-client | 22 |
| SCP | ssh2-sftp-client | 22 |
| SSH | ssh2 | 22 |
| WebDAV | webdav | 80 / 443 |

SMB support: run `npm install @marsaud/smb2` and uncomment the SMB section in `index.js`.

## Setup

```bash
cd server
npm install
npm start
```

## Environment Variables

Create a `.env` file in `server/` (never commit this):

```env
PORT=3001
ALLOWED_ORIGIN=https://webftp.ssmg4.dpdns.org
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the proxy listens on |
| `ALLOWED_ORIGIN` | `*` | CORS allowed origin — always set this in production |

## Running in production

Use pm2 to keep the server alive across reboots:

```bash
npm install -g pm2
pm2 start index.js --name webftp-proxy
pm2 save
pm2 startup
```

## Nginx configuration

The proxy runs on port 3001. Nginx proxies `/api/` requests to it:

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}
```

With this in place, the frontend calls `/api/connect`, `/api/list`, etc. and Nginx forwards them to the proxy — no CORS issues, no port exposed publicly.

## Configuring WebFTP

In WebFTP → Settings → Connection → Proxy Server URL, enter:

```
https://webftp.ssmg4.dpdns.org
```

(No port needed — Nginx handles the routing via the `/api/` location block.)

If no proxy URL is set, WebFTP falls back to the in-memory demo filesystem.

## Security

- `ALLOWED_ORIGIN` is set to `https://webftp.ssmg4.dpdns.org` — unauthorized origins are rejected by CORS.
- Credentials are held in memory only for the duration of each session and cleaned up on disconnect.
- The proxy port (3001) should be firewalled — only Nginx needs to reach it locally.
- Cloudflare handles HTTPS termination. Set SSL/TLS mode to **Full** in Cloudflare dashboard.
