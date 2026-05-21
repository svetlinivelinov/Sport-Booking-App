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

## Support Folder Reuse Policy

Support Folder is input material only. Reuse ideas, behavior, and requirements as references, then re-implement in the v1 monorepo architecture.

- Do not copy legacy runtime JS/HTML/CSS as production code.
- Do not treat legacy SQL files as final schema source.
- Do map requirements and UI references into typed, modular Next.js/Expo/Drizzle implementation.

## Support Folder Reuse Matrix

| Support path | Reuse intent | Re-implementation target |
|---|---|---|
| Support Folder/requirements/NEW CAPSTONE.md | Capstone scoring and acceptance checklist | docs/BACKLOG.md, docs/IMPLEMENTATION_PLAN.md |
| Support Folder/requirements/NEW Project.md | Gap analysis and missing-scope checklist | docs/BACKLOG.md, docs/SCREEN_INVENTORY.md |
| Support Folder/product/App Redesign.md | UI layout direction | apps/web/src/app, apps/mobile/src/screens |
| Support Folder/product/App Redesign final.md | Preferred screen compositions | apps/web/src/app, apps/mobile/src/screens |
| Support Folder/product/App Redesign Colors.md | Palette and visual cues | packages/shared/src, apps/web/src/app/globals.css |
| Support Folder/product/Theme GPT.md | Theme/token ideas | packages/shared/src/theme |
| Support Folder/product/Game Types.md | Sport domain concepts and variants | packages/shared/src/domain, apps/web/src/db/schema.ts |
| Support Folder/product/App Refactoring.md | Legacy anti-pattern warnings | apps/web/src, apps/mobile/src |
| Support Folder/logic-references/auth.js | Auth behavior reference | apps/web/src/auth, apps/web/src/app/api/auth |
| Support Folder/logic-references/groups.js | Group workflow behavior | apps/web/src/app/api/groups, apps/web/src/app/groups |
| Support Folder/logic-references/events.js | Event lifecycle behavior | apps/web/src/app/api/sessions, apps/web/src/app/events |
| Support Folder/logic-references/court.js | Match/session progression ideas | apps/web/src/app/court, apps/web/src/services |
| Support Folder/logic-references/results.js | Results and ranking behavior | apps/web/src/app/results, packages/shared/src/domain/rules |
| Support Folder/logic-references/profile.js | Profile flow reference | apps/web/src/app/profile, apps/mobile/src/screens |
| Support Folder/logic-references/admin.js | Admin workflow reference | apps/web/src/app/admin, protected API routes |
| Support Folder/logic-references/notifications.js | Notification pattern reference | apps/web/src/services/notifications, mobile client hooks |
| Support Folder/database/004_game_lifecycle.sql | Lifecycle schema reference only | apps/web/src/db/schema.ts + drizzle migrations |
| Support Folder/database/database_additions.js | Legacy lifecycle helper logic | apps/web/src/services (typed modules) |
| Support Folder/ui-references/pages/*.html | Screen inventory and flow baseline | docs/SCREEN_INVENTORY.md, web/mobile screens |
| Support Folder/ui-references/assets/js/* | UI behavior examples | React/TypeScript components + hooks |
| Support Folder/ui-references/assets/css/* | Visual style ideas | tokenized styles in web/mobile |
| Support Folder/ui-references/assets/sql/* | SQL experiments/variants for comparison | validate assumptions only; not direct migration source |
| Support Folder/ui-references/archive/* | Historical reference for diffs | traceability only, not active implementation |
