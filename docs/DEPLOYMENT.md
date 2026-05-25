# Deployment and Scalability Runbook

This document defines the minimum steps to complete the final plan item: paging, seed validation, and deployment.

## Pre-Netlify TODO (Must Pass)

- [ ] Set Netlify env vars for `apps/web`: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
- [ ] Run production DB migrations against Neon before first production traffic.
- [ ] Confirm Netlify web settings:
   - Base directory: `apps/web`
   - Build command: `npm run build`
   - Publish directory: leave empty for Next.js runtime
- [ ] Deploy web and verify:
   - `GET /api/health`
   - login works
   - `GET /api/sessions?page=1&pageSize=20` with auth token works
- [ ] (Optional mobile site) Set `EXPO_PUBLIC_API_BASE_URL` to deployed web URL and redeploy mobile export.

## Environment Variables

### apps/web

- `DATABASE_URL`: Neon Postgres connection string
- `JWT_SECRET`: random long secret for auth signing

Create `apps/web/.env` for local development, starting from `apps/web/.env.example`.

### apps/mobile

- `EXPO_PUBLIC_API_BASE_URL`: deployed web backend base URL

Create `apps/mobile/.env` from `apps/mobile/.env.example` before building export bundles.

## Local Validation Flow

0. Validate env configuration:
   - `npm run check:web-env`
0. Start both apps with clean ports:
   - `npm run dev:fresh`
   - Web default URL: `http://localhost:3010`
   - Mobile web default URL: `http://localhost:8090`
1. Run migrations:
   - `npm run db:migrate`
2. Seed a small dataset:
   - `npm run db:seed:small`
3. Seed a large dataset (10k+ rows):
   - `npm run db:seed:large`
4. Validate paged API:
   - `GET /api/sessions?page=1&pageSize=20`
5. Validate health endpoint:
   - `GET /api/health`
6. Run smoke checks against running web + mobile web servers:
   - `npm run test:smoke`
   - Optional custom URLs: `npm run test:smoke -- -WebUrl http://localhost:3000 -MobileUrl http://localhost:8081`
   - For this workspace, use explicit URLs to avoid auto-detection issues:
     - `npm run test:smoke -- -WebUrl http://localhost:3010 -MobileUrl http://localhost:8081`

## Paging Acceptance

- API supports `page` and `pageSize`.
- UI reads and updates paging params.
- Large seed mode remains responsive in list pages.

## Web Deployment (Next.js)

Suggested hosts: Vercel or Netlify.

1. Connect repository.
2. Set root/project to `apps/web`.
3. Configure env vars (`DATABASE_URL`, `JWT_SECRET`).
4. Build command: `npm run build`.
5. Start command: `npm run start`.
6. Verify `/api/health` and auth endpoints.

## Recommended Setup for This Project

Use Neon for database and Netlify for hosting.

## Exact Inputs You Need Ready

- GitHub repository URL:
   - `https://github.com/svetlinivelinov/Sport-Booking-App`
- Production database URL from Neon:
   - `DATABASE_URL=<neon-connection-string>`
- Production JWT secret:
   - `JWT_SECRET=<strong-random-value>`
- Production API URL (after web deploy):
   - `EXPO_PUBLIC_API_BASE_URL=<https://your-web-site.netlify.app>`

Generate a JWT secret quickly:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

### 1. Neon Postgres (Database)

1. Create a Neon project and database.
2. Copy the Postgres connection string.
3. Ensure SSL is enabled (`sslmode=require` in the URL when needed).
4. Use this value as `DATABASE_URL` for local and Netlify environments.

### 2. Netlify for Next.js Web App (apps/web)

Create a Netlify site connected to this repository with these settings:

1. Base directory: `apps/web`
2. Build command: `npm run build`
3. Publish directory: leave empty for Next.js runtime
4. Environment variables:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (strong random secret)
   - `NODE_ENV=production`
5. Deploy and validate:
   - `/api/health`
   - `/api/sessions?page=1&pageSize=20`

Web site checklist:

- [ ] Netlify site connected to `main` branch
- [ ] Base directory set to `apps/web`
- [ ] `DATABASE_URL` set
- [ ] `JWT_SECRET` set
- [ ] `NODE_ENV=production` set
- [ ] First deploy succeeded
- [ ] `https://<web-url>/api/health` returns OK
- [ ] `https://<web-url>/api/sessions?page=1&pageSize=20` returns data with auth token

### 3. Netlify for Mobile Web Export (Optional Second Site)

If you want the Expo web build hosted on Netlify as a separate frontend:

1. Create a second Netlify site connected to this same repository and `main` branch.
2. Build settings:
   - Base directory: `apps/mobile`
   - Netlify config path: `apps/mobile/netlify.toml`
   - Build command: `npm run export:web`
   - Publish directory: `dist`
3. Set `EXPO_PUBLIC_API_BASE_URL` to your deployed Next.js URL.
4. Redeploy mobile site after changing API base URL.
5. Verify login and sessions list from the deployed mobile URL.

Static hosting note:

- Add `apps/mobile/public/_redirects` with `/* /index.html 200` to keep SPA route refreshes working.

Mobile site checklist:

- [ ] Netlify mobile site created
- [ ] Config path set to `apps/mobile/netlify.toml`
- [ ] Build command set to `npm run export:web`
- [ ] Publish directory set to `dist`
- [ ] `EXPO_PUBLIC_API_BASE_URL` set to deployed web URL
- [ ] Deploy succeeded and app loads
- [ ] Login works against deployed backend

## Mobile Web Deployment (Expo Export)

1. Build export:
   - `npm run build:mobile:web`
2. Publish exported web bundle to static hosting.
3. Point mobile client API base URL to deployed web backend.

## Submission Checklist

- Web app live URL
- Mobile web export live URL
- Demo credentials
- 10k+ dataset tested with pagination
- Commit history requirements satisfied

Final handoff checklist:

- [ ] Add live URLs and demo credentials in `docs/Capstone.md`
- [ ] Confirm web + mobile URLs are reachable from incognito window
- [ ] Confirm at least one end-to-end flow on deployed environment:
   - login -> join session -> submit score -> results visible

## Current Local Verification Snapshot (May 24, 2026)

- `npm run check:web-env`: PASS
- `npm run test:smoke -- -WebUrl http://localhost:3010 -MobileUrl http://localhost:8081`: PASS
- `npm run build:web`: PASS
- `npm run build:mobile:web`: PASS
- `git push origin main`: PASS (`9f81ebc`, `29a8f5e`)
