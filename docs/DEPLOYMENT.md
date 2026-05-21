# Deployment and Scalability Runbook

This document defines the minimum steps to complete the final plan item: paging, seed validation, and deployment.

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

### 3. Netlify for Mobile Web Export (Optional Second Site)

If you want the Expo web build hosted on Netlify as a separate frontend:

1. Run `npm run build:mobile:web`.
2. Create a second Netlify site.
3. Set publish directory to `apps/mobile/dist`.
4. Set `EXPO_PUBLIC_API_BASE_URL` to your deployed Next.js URL.
5. Redeploy mobile site after changing API base URL.

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
