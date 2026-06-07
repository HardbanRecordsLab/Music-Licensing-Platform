# Commercial Music Licensing Platform

A React + Vite frontend with an Express/TypeScript backend for secure B2B music licensing, admin dashboards, white-label players, and signed audio streaming.

## Key features

- JWT/Bearer authentication for frontend and API routes
- Admin dashboard for managing tracks, playlists, invoices, users, and access pages
- White-label B2B player with playlist playback and signed audio tokens
- HMAC-signed audio URLs for secure media delivery
- Demo user authentication for admin and subscriber workflows

## Local setup

### Prerequisites

- Node.js 18+ (or compatible)
- npm

### Install

```bash
npm install
```

> Note: The project no longer relies on a native SQLite package for local development, so `npm install` should work on Windows without requiring Visual Studio C++ build tools.

### Environment variables

Create a `.env` file at the project root and define:

```env
JWT_SECRET=your_jwt_secret
HMAC_SECRET=your_hmac_secret
PORT=3000
```

### Run locally

```bash
npm run dev
```

The frontend is served by Vite and the backend by `server.ts` in the same project.

## Authentication flow

- Login via `POST /api/auth/login` with `email` and `password`
- Backend issues a JWT token
- Frontend stores the token in `localStorage`
- Protected API calls send `Authorization: Bearer <token>`
- `GET /api/auth/me` validates the token and returns the current user

## Demo accounts

- `admin@hrl.pl` / `adminpass` — admin dashboard access
- `aroma@b2b.pl` / `subscriberpass` — subscriber B2B player access
- `trendsetter@b2b.pl` / `subscriberpass`
- `titan@b2b.pl` / `subscriberpass`
- `vip@b2b.pl` / `subscriberpass`

## Notes

- The backend currently uses in-memory data stores for prototyping.
- Signed audio URLs are generated and validated by `src/audio-signing.ts`.
- The admin dashboard is implemented in `src/components/AdminDashboard.tsx`.
- The B2B player is implemented in `src/components/B2BPlayer.tsx`.

## Useful commands

```bash
npm run dev
npm run build
npm run preview
```

## Production deployment

This repository supports two separate deployment targets:

- **Frontend on Vercel** — static React SPA built with Vite, deployed to:
  - `https://app.hrl-sync-hub.hardbanrecordslab.online/`
- **Backend on VPS** — Express/TypeScript API and WebSocket server running on Docker Compose, exposed at:
  - `https://hrl-sync-hub.hardbanrecordslab.online/`

### Frontend deployment on Vercel

1. Create a Vercel project from this repository.
2. Set the build command to:
   - `npm run vercel-build`
3. Set the output directory to:
   - `dist/client`
4. Add the environment variable:
   - `VITE_API_URL=https://hrl-sync-hub.hardbanrecordslab.online`
5. Deploy.

The Vercel deployment uses `vercel.json` and publishes the static SPA from `dist/client`.

### Backend deployment on VPS

1. Copy `deploy/.env.example` to `deploy/.env` and fill in secrets.
2. Ensure your backend is reachable at:
   - `https://hrl-sync-hub.hardbanrecordslab.online`
3. Ensure WordPress persistence is enabled by keeping the host mount directories in `deploy/docker-compose.yml`:
   - `./deploy/wp-app` for the WordPress root
   - `./deploy/wp-content/mu-plugins` for mu-plugins
   - `./deploy/wp-content/uploads` for media and uploads
4. Run the backend deploy script on your VPS with Docker installed:
   - Linux/macOS: `bash deploy/deploy-backend.sh`
   - Windows PowerShell: `./deploy/deploy-backend.ps1`

This deploy script builds the backend only and starts the `node-express-api`, `cache-redis`, and `db-mysql` services.

### Backup, rollback and smoke checks

Before any production deploy, use the backup script to snapshot the current site state:

```bash
bash deploy/backup.sh
```

To restore from the latest saved backup, use:

```bash
bash deploy/rollback.sh
```

To verify the backend service health, use:

```bash
bash deploy/smoke.sh http://localhost:9108
```

### Combined local deployment

If you want to build both frontend and backend locally and run the full stack from this repo, use:

```bash
npm run build
bash deploy/deploy-app.sh
```

## Documentation

See `DOKUMENTACJA_SYSTEMU.md` for full product and architecture details.
