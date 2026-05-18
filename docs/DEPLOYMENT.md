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

## Paging Acceptance

- API supports `page` and `pageSize`.
- UI reads and updates paging params.
- Large seed mode remains responsive in list pages.

## Web Deployment (Next.js)

Suggested hosts: Vercel, Netlify, or Railway.

1. Connect repository.
2. Set root/project to `apps/web`.
3. Configure env vars (`DATABASE_URL`, `JWT_SECRET`).
4. Build command: `npm run build`.
5. Start command: `npm run start`.
6. Verify `/api/health` and auth endpoints.

### Railway (Monorepo-safe Commands)

If Railway cannot set project root cleanly, use workspace-aware commands from repository root:

1. Build command: `npm run build --workspace apps/web`
2. Start command: `npm run start --workspace apps/web`
3. Add env vars: `DATABASE_URL`, `JWT_SECRET`
4. Set health check path to `/api/health`
5. Deploy and validate `/api/health` and `/api/sessions?page=1&pageSize=20`

Repository already includes a baseline Railway service config at `railway.toml`.

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
