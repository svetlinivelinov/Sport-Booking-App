# Sport Booking App v1

Capstone-ready monorepo for a multi-platform sport booking app.

## Repository Status

- Production code is implemented in:
  - `apps/web`
  - `apps/mobile`
  - `packages/shared`

## Monorepo Layout

```text
apps/
  web/
  mobile/
packages/
  shared/
docs/
```

## Source of Truth

- Agent rules: `AGENTS.md` and `.github/copilot-instructions.md`
- Delivery plan: `docs/IMPLEMENTATION_PLAN.md`
- Scope and tracking: `docs/SCREEN_INVENTORY.md` and `docs/BACKLOG.md`

## Local Development

1. Install dependencies:
  - `npm install`
2. Start web only (recommended):
  - `npm run dev:fresh`
3. Start web + mobile web together (higher process usage):
  - `npm run dev:all:fresh`
4. Common local URLs:
  - Web: `http://localhost:3010`
  - Mobile web: `http://localhost:8090`
5. Run smoke checks:
  - `npm run test:smoke`

## Database Setup

1. Configure real `DATABASE_URL` and `JWT_SECRET` in `apps/web/.env`.
2. Validate env:
  - `npm run check:web-env`
3. Run migrations and seed:
  - `npm run db:migrate`
  - `npm run db:seed:small`
  - `npm run db:seed:large`

## Deployment Target

- Database provider: Neon PostgreSQL
- Hosting: Netlify (web + optional Expo web export)
- Runbook: `docs/DEPLOYMENT.md`
