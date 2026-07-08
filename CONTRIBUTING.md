# Contributing to WebFTP

Thank you for your interest in contributing! This document covers everything you need to know to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Project Architecture](#project-architecture)
- [Implementing Real Protocol Backends](#implementing-real-protocol-backends)
- [Coding Style](#coding-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

Be respectful. Constructive criticism is welcome; personal attacks are not.

---

## How to Contribute

1. Fork the repository and create your branch from `main`.
2. Make your changes following the coding style below.
3. Ensure `npm run lint` and `npx tsc --noEmit` both pass with no errors.
4. Open a pull request with a clear title and description of what you changed and why.

For large changes (new features, architecture changes, protocol implementations), open an issue first to discuss the approach before writing code.

---

## Project Architecture

WebFTP follows an **MVP (Model–View–Presenter)** pattern:

```
src/
├── models/         # Data layer — interfaces and implementations
│   ├── FtpRepository.ts        # FtpRepository interface + VFS mock impl
│   ├── BookmarkRepository.ts   # Bookmark persistence
│   └── TransferQueueManager.ts # Transfer queue state management
│
├── presenters/     # Business logic hooks — bridge between models and views
│   ├── useFtpConnection.ts     # Connect / disconnect logic
│   ├── useRemoteExplorer.ts    # Directory navigation, file CRUD
│   └── useTransferQueue.ts     # Upload / download orchestration
│
├── pages/          # Route-level view components
│   ├── Index.tsx   # Main app (file explorer shell)
│   ├── Home.tsx    # Landing page
│   ├── Auth.tsx    # Sign in / sign up
│   └── NotFound.tsx
│
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme)
├── hooks/          # Utility hooks
├── lib/            # Pure utility functions
├── types/          # Shared TypeScript type definitions
└── integrations/   # Third-party client setup (Supabase)
```

The key interface is `FtpRepository` in `src/models/FtpRepository.ts`. Any real protocol implementation simply needs to implement that interface — the presenters and views are completely decoupled from the underlying transport.

---

## Implementing Real Protocol Backends

The current `FtpRepositoryImpl` is a fully in-memory virtual filesystem used for demo purposes. Real protocol support requires a **backend proxy server** because browsers cannot open raw TCP sockets.

### Architecture for real protocols

```
Browser (WebFTP frontend)
    ↕  HTTPS / WebSocket
Backend proxy server (Node.js)
    ↕  FTP / SFTP / SMB / WebDAV
Remote server
```

### Recommended approach

1. Create a Node.js/Express (or Fastify) backend in a `server/` directory.
2. Use the following Node.js libraries for each protocol:
   - **FTP / FTPS** — `basic-ftp`
   - **SFTP** — `ssh2-sftp-client`
   - **SMB** — `@marsaud/smb2`
   - **WebDAV** — `webdav` (client library)
3. Expose a REST or WebSocket API that mirrors the `FtpRepository` interface.
4. Create a `FtpRepositoryRemoteImpl` in `src/models/` that calls your backend instead of the VFS.
5. The frontend switches between `FtpRepositoryImpl` (demo/local) and `FtpRepositoryRemoteImpl` (real) based on an env flag.

This backend would be deployed on your server alongside the frontend, or on a separate VPS. See `server/README.md` for setup instructions.

---

## Coding Style

- **No unnecessary comments.** Only add a comment if it explains *why* something is done in a non-obvious way, not *what* it does.
- TypeScript strict mode is on. Avoid `any` unless genuinely unavoidable, and never leave untyped `any` in public interfaces.
- Use named exports for components, default exports only for page-level components (to match the existing convention).
- Keep components focused. If a component is doing too much, split out a presenter hook.
- Do not modify `src/index.css` theming variables or `src/contexts/ThemeContext.tsx` without discussing in an issue first — the theming system is complex and intentional.
- Do not add new `npm` dependencies without a good reason. Prefer the existing stack.

---

## Commit Messages

Use the following format:

```
<type>(<scope>): <short summary>

[optional body explaining why, not what]
```

Types: `feat`, `fix`, `refactor`, `docs`, `ci`, `chore`, `style`

Examples:
```
feat(editor): add SCSS syntax highlighting
fix(auth): clear password field on failed sign-in
ci: add self-hosted server deploy workflow
docs: rewrite README with deployment guide
```

---

## Pull Request Process

1. Make sure CI passes (lint + typecheck + build).
2. Keep PRs focused — one logical change per PR.
3. Update the README if your change adds or removes a user-facing feature.
4. A maintainer will review and merge. For protocol backend work, expect detailed review of the security model.
