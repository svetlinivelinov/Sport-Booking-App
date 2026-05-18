# AGENTS.md - Sport Booking App v2

This file defines project-wide instructions for AI coding agents.

## Project Context
Sport Booking App v2 is a capstone project that must deliver:
- Next.js web app with backend APIs
- Expo mobile app
- Neon PostgreSQL with Drizzle ORM
- JWT-based authentication and role-based authorization

The product must be sport-agnostic. It should support multiple sports (for example padel, football, tennis) through configuration and pluggable rules, without codebase-wide renaming.

Legacy implementation and design materials are stored in Support Folder and used strictly as references.

## Source of Truth
- Functional and scoring requirements: Support Folder/requirements/NEW CAPSTONE.md
- Gap checklist and missing scope: Support Folder/requirements/NEW Project.md
- Reuse mapping: SOURCE_MAP.md

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
6. Keep reference files read-only in Support Folder.
7. Re-implement legacy logic in TypeScript; do not copy old scripts as production code.
8. Use neutral domain names in code and DB (for example activity/session/venue/participant/matchup) instead of hardcoded single-sport terms.
9. Store sport-specific rules in configurable modules (scoring, scheduling, ranking), not in generic services.
10. Keep app branding configurable (name, labels, theme tokens) to allow easy sport or product renaming.

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
