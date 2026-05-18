# Project Map for Sport Booking App v1

Purpose: define the active project structure, ownership boundaries, and implementation direction for this repository.

## Source of Truth

1. AGENTS.md
2. .github/copilot-instructions.md
3. docs/IMPLEMENTATION_PLAN.md
4. docs/SCREEN_INVENTORY.md
5. docs/BACKLOG.md

## Monorepo Layout

```text
apps/
  web/        # Next.js web app + backend APIs
  mobile/     # Expo mobile app
packages/
  shared/     # Shared types, validation, constants
docs/         # Planning and delivery docs
```

## Responsibility Map

| Path | Responsibility |
|---|---|
| apps/web | Web UI, backend API routes, auth middleware, service orchestration |
| apps/mobile | Mobile user flows, API integration, responsive mobile UX |
| packages/shared | DTOs, schemas, enums, constants, cross-platform contracts |
| docs | Scope, milestones, screen coverage, backlog and decisions |
| .github | Repo-level instructions and project guidance |

## Architecture Rules

- Keep business logic in services.
- Keep API contracts and validation strict and shared where possible.
- Use Drizzle migrations for schema changes.
- Keep core domain sport-agnostic.
- Implement sport-specific scoring/scheduling/ranking through configurable modules.
- Keep branding and labels configurable for easy renaming and sport switching.

## Do Not Do

- Do not hardcode a single sport in core DB schema, services, or API contracts.
- Do not bypass migrations with ad-hoc schema changes.
- Do not couple mobile and web to divergent domain models.
- Do not commit secrets.
