# WebFTP

<div align="center">
  <img src="src/assets/logo.png" alt="WebFTP Logo" width="96" />
  <br /><br />
  <strong>A modern, browser-based file manager for FTP, FTPS, SFTP, SMB, WebDAV and local servers.</strong>
  <br /><br />

  ![CI](https://github.com/Hexadecinull/WebFTP/actions/workflows/ci.yml/badge.svg)
  ![License](https://img.shields.io/github/license/Hexadecinull/WebFTP)
  ![GitHub stars](https://img.shields.io/github/stars/Hexadecinull/WebFTP?style=social)
  ![GitHub issues](https://img.shields.io/github/issues/Hexadecinull/WebFTP)
</div>

---

## Overview

WebFTP is an open-source, web-based file manager that lets you connect to remote servers directly from your browser — no desktop client, no installation. It supports multiple transfer protocols, an inline code editor with syntax highlighting, a drag-and-drop upload system, a fully customizable theming engine, and more.

Built with React, TypeScript, Vite, Tailwind CSS, CodeMirror, and backed by Supabase for authentication and saved connections.

---

## Features

### File Management
- Browse, navigate and manage files and folders on remote servers
- Create, rename, move, delete files and folders
- Drag and drop files between folders to move them
- Drag and drop files from your desktop to upload them
- Download files and folders as ZIP, TAR, or 7Z archives
- List view and Grid view modes
- File properties panel (size, permissions, modified date)
- Right-click context menus on files and on the background

### Transfer System
- Real-time transfer queue with progress tracking
- Pause, resume, and cancel individual transfers
- Concurrent transfer support (configurable)
- Auto-retry on failure (configurable)
- Configurable buffer size, connection timeout, and keep-alive interval

### Code Editor
- Inline file editing powered by CodeMirror 6
- Syntax highlighting for 30+ languages: JavaScript, TypeScript, JSX/TSX, Python, Go, Java, C#, Rust, Ruby, PHP, Kotlin, Swift, HTML, CSS, SCSS, SQL, Markdown, YAML, TOML, JSON, Dockerfile, Shell, Nginx config, Makefile, and more
- Markdown preview mode
- Save files directly back to the server

### Authentication & Accounts
- Sign up and sign in via Supabase Auth
- Email verification on sign-up
- Username and avatar customization
- Saved connections tied to your account
- Recent connections history (for guests, scoped by IP)
- Guest mode — connect without an account

### Bookmarks
- Save frequently used server paths as bookmarks
- Quickly navigate to bookmarked directories

### Theming System
- 15 built-in color presets (Blue, Purple, Green, Red, Orange, Teal, Pink, Cyan, Indigo, Amber, Emerald, Rose, Violet, Sky, Fuchsia)
- Custom color picker — pick any hex color and the UI adapts automatically
- Material You-style dynamic theming: backgrounds, cards, sidebar, and borders all tint to match the primary color
- Light and Dark mode with a manual toggle
- AMOLED / true-black dark mode option
- System theme detection (auto-follows OS preference)
- All theme settings are persisted across sessions in localStorage

### Protocols Supported

| Protocol | Description |
|----------|-------------|
| FTP | Standard File Transfer Protocol |
| FTPS | FTP over TLS/SSL |
| SFTP | SSH File Transfer Protocol with SSH key support |
| SMB | Windows/Samba network shares |
| WebDAV | Web Distributed Authoring and Versioning |
| Local | Local filesystem browsing |

> **Note:** The current release uses an in-memory virtual filesystem for demo/preview purposes. Real protocol backends (FTP, SFTP, SMB, WebDAV) require a backend proxy server. See [CONTRIBUTING.md](CONTRIBUTING.md) for architecture details and the roadmap for real implementations.

### Miscellaneous
- Easter egg hidden somewhere in the interface 🥚
- Mobile-responsive layout
- Keyboard-accessible UI throughout

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + CSS custom properties (HSL design tokens) |
| UI components | shadcn/ui (Radix UI primitives) |
| Code editor | CodeMirror 6 via @uiw/react-codemirror |
| Auth, DB & Storage | Supabase (PostgreSQL + GoTrue Auth + S3-compatible storage) |
| State / data fetching | TanStack Query v5 |
| Forms | react-hook-form + zod |
| Routing | React Router v6 |
| Architecture | MVP (Model–View–Presenter) pattern |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Local development

```bash
# Clone the repo
git clone https://github.com/Hexadecinull/WebFTP.git
cd WebFTP

# Install dependencies
npm install

# Copy the environment file and fill in your Supabase credentials
cp .env.example .env

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment variables

Create a `.env` file at the root with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

You can find all three values in your Supabase project under **Project Settings → API**.

---

## Deployment

### Deploying to InfinityFree (recommended)

InfinityFree is the recommended hosting option for WebFTP. It gives you a full Apache web host, a custom domain, and FTP access — all for free. Your Supabase project handles the database, auth, and storage remotely, so the frontend only needs a static file host with proper Apache rewrite support.

#### Step 1 — Create an InfinityFree account

Go to [infinityfree.net](https://infinityfree.net) and create a free account. Create a hosting account and note your FTP credentials from the control panel (FTP server hostname, username, and password).

#### Step 2 — Add GitHub Secrets

In your GitHub repo, go to **Settings → Secrets and variables → Actions** and add:

| Secret name | Value |
|-------------|-------|
| `FTP_SERVER` | Your InfinityFree FTP hostname (e.g. `ftpupload.net`) |
| `FTP_USERNAME` | Your InfinityFree FTP username |
| `FTP_PASSWORD` | Your InfinityFree FTP password |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

#### Step 3 — Configure Supabase redirect URLs

In your Supabase project under **Authentication → URL Configuration**, add your InfinityFree domain to the **Redirect URLs** list (e.g. `https://yourdomain.infinityfreeapp.com`). This is required so that email verification links redirect to the right place after sign-up.

#### Step 4 — Push to main

The deploy workflow (`.github/workflows/deploy.yml`) will automatically:
1. Build the Vite app with your Supabase secrets injected as env vars
2. Write a `.htaccess` into `dist/` so React Router's client-side routes work on Apache without 404s on hard refresh
3. Upload the built `dist/` folder to your InfinityFree `htdocs/` via FTP

Every subsequent push to `main` deploys only the files that changed (incremental upload — fast).

#### Connecting a custom domain

In the InfinityFree control panel go to **Domains → Add Domain** and point your domain's DNS to InfinityFree's nameservers as instructed. Once DNS propagates, your WebFTP instance will be live at your custom domain.

---

## Supabase Setup

If you're setting up a fresh Supabase project, run the included migrations with the Supabase CLI:

```bash
supabase login
supabase link --project-ref your-project-id
supabase db push
```

The migrations in `supabase/migrations/` create the `profiles` table and the `avatars` storage bucket with the correct Row Level Security policies.

---

## CI / CD

Two GitHub Actions workflows are included out of the box:

**`ci.yml`** — runs on every push and pull request:
- ESLint
- TypeScript type check (`tsc --noEmit`)
- Production build

**`deploy.yml`** — runs on every push to `main`:
- Builds the app with Supabase secrets injected
- Writes `.htaccess` for SPA routing on Apache
- Deploys to InfinityFree via FTP (incremental)

---

## Contributing

Contributions are very welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on getting involved, the project architecture, coding style, and the roadmap for implementing real protocol backends.

---

## License

WebFTP is licensed under the **GNU General Public License v3.0**.  
See the [LICENSE](LICENSE) file for the full license text.

You are free to use, modify, and distribute this software under the terms of the GPL-3.0. Any derivative work must also be distributed under the same license.
