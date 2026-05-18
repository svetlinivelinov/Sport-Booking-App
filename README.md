# Sport Booking App v2

Capstone-ready monorepo bootstrap for a multi-platform sport booking app.

## Repository Status

- Reference-only materials are under `Support Folder/`.
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
Support Folder/
```

## Source of Truth

- Requirements: `Support Folder/requirements/NEW CAPSTONE.md`
- Gap analysis: `Support Folder/requirements/NEW Project.md`
- Reuse map: `SOURCE_MAP.md`
- Agent rules: `AGENTS.md` and `.github/copilot-instructions.md`

## Next Steps

1. Initialize `apps/web` with Next.js + TypeScript + Tailwind.
2. Initialize `apps/mobile` with Expo + TypeScript.
3. Set up Drizzle + Neon integration in web app.
4. Create first migration and seed scripts.
5. Implement auth (register/login/logout, JWT, roles).
