# Sport Booking App v2 - Copilot Instructions

## Mission
Build a new capstone-compliant v2 app from scratch, using the files under Support Folder only as reference material.

The app must be multi-sport and easy to rebrand. Never assume only one sport.

## Required Stack
- Next.js + React + TypeScript + Tailwind for web and backend
- Expo + React Native for mobile
- Neon PostgreSQL + Drizzle ORM
- JWT auth + bcrypt (or argon2)

## Architecture Rules
- Use monorepo structure:
	- apps/web (Next.js web + backend)
	- apps/mobile (Expo app)
	- packages/shared (shared types, validation, constants)
- Keep business logic in services.
- Expose REST API endpoints for mobile app consumption.
- Prefer Server Actions only for web-specific interactions.
- Keep core domain generic and sport-agnostic.
- Implement sport-specific behavior through pluggable modules/configs (rules, scoring, ranking, scheduling).
- Keep labels/branding/theme tokens configurable to support easy app renaming and sport switching.

## Reference Folder Policy
- Treat Support Folder as read-only references.
- Never move runtime code into Support Folder.
- Do not copy old JS/HTML directly into production apps; re-implement in TypeScript.
- Reuse domain concepts, flows, schema ideas, and UI direction only.

## Capstone Guardrails
- Minimum 10 web screens.
- Minimum 5 mobile screens.
- Minimum 4 relational DB tables via Drizzle migrations.
- Add seed script and test with 10,000+ records for paging/perf validation.
- Implement roles (user/admin) and protected routes/endpoints.
- Prepare deployment for both web/backend and mobile web export.

## Coding Standards
- Use strict TypeScript where practical.
- Validate request payloads at API boundaries.
- Centralize env handling and never hardcode secrets.
- Favor reusable UI components and keep styling token-driven.
- Add short, meaningful comments only around complex logic.
- Avoid hardcoded sport names in core code paths, database schema, and API contracts.

## Workflow
- Work in small vertical slices: schema -> service -> API -> web screen -> mobile screen.
- Keep commits small and meaningful.
- Preserve clear commit history across multiple days for capstone scoring.

## Out of Scope for Direct Reuse
- Old runtime artifacts and logs.
- Legacy environment files and secrets.
- Copy-paste of legacy architecture patterns that conflict with capstone stack.
