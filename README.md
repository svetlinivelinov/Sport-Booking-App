# Sport Booking App v1

Capstone-ready monorepo for a multi-platform sport booking app.

## Repository Status

- Production code will be developed in:
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

## Next Steps

1. Initialize `apps/web` with Next.js + TypeScript + Tailwind.
2. Initialize `apps/mobile` with Expo + TypeScript.
3. Set up Drizzle + Neon integration in web app.
4. Create first migration and seed scripts.
5. Implement auth (register/login/logout, JWT, roles).
