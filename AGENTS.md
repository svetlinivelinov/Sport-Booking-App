# AGENTS.md - Sport Booking App v1

This file defines project-wide instructions for AI coding agents.

## Project Context
Sport Booking App v1 is a capstone project that must deliver:
- Next.js web app with backend APIs
- Expo mobile app
- Neon PostgreSQL with Drizzle ORM
- JWT-based authentication and role-based authorization

The product must be sport-agnostic. It should support multiple sports (for example padel, football, tennis) through configuration and pluggable rules, without codebase-wide renaming.

## Technologies
- Next.js + React + Tailwind
- Neon PostgreSQL + Drizzle ORM
- JWT + bcrypt/argon2

## Source of Truth
- Project rules: AGENTS.md and .github/copilot-instructions.md
- Delivery plan: docs/IMPLEMENTATION_PLAN.md
- Scope and task tracking: docs/SCREEN_INVENTORY.md and docs/BACKLOG.md

## Required Repository Direction
Implement a monorepo with this target shape:
- apps/web
- apps/mobile
- packages/shared
- docs

## Mandatory Engineering Rules
1. Database schema changes must be done via Drizzle migrations.
2. Keep backend logic in service modules, not directly in route handlers.
3. Use DTO validation for all API input.
4. Implement JWT auth, password hashing, and role checks.
5. Add server-side paging for list endpoints.
6. Keep app code and docs self-contained in the monorepo.
7. Re-implement features in TypeScript and keep architecture consistent across web/mobile/shared.
8. Use neutral domain names in code and DB (for example activity/session/venue/participant/matchup) instead of hardcoded single-sport terms.
9. Store sport-specific rules in configurable modules (scoring, scheduling, ranking), not in generic services.
10. Keep app branding configurable (name, labels, theme tokens) to allow easy sport or product renaming.
11. Use modular design: split features into self-contained components/modules and avoid oversized files.

## Delivery Targets
- Web app: at least 10 screens
- Mobile app: at least 5 screens
- DB: at least 4 related tables
- Seed script for demo data and performance test (10,000+ rows)
- Deploy web/backend and mobile web export
- Provide demo credentials

## Agent Workflow Preference
Use small vertical slices:
1. Plan feature and acceptance criteria.
2. Add/update DB schema and migration.
3. Implement service layer and tests (when possible).
4. Expose API route(s).
5. Implement web UI.
6. Implement mobile UI.
7. Verify end-to-end behavior.

## Safety and Quality
- Never commit secrets.
- Keep env variables in .env files excluded from source control.
- Avoid destructive file operations unless explicitly requested.
- Preserve existing user files unless a migration/refactor is agreed.

## UI Guidelines
- Build modern, responsive UI for desktop and mobile layouts.
- Prefer server-rendered components in Next.js for data-driven screens.
- Use client components only for browser interaction, local UI state, and form behavior.
