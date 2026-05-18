# Sport Booking App v1 - Copilot Instructions

## Mission
Build a capstone-compliant v1 app from scratch in this monorepo.

The app must be multi-sport and easy to rebrand. Never assume only one sport.

## Required Stack
- Next.js + React + TypeScript + Tailwind for web and backend
- Expo + React Native for mobile (prefer Expo Router for navigation)
- Neon PostgreSQL + Drizzle ORM
- JWT auth + bcrypt (or argon2)

## Architecture Rules
- Use monorepo structure:
	- apps/web (Next.js web + backend)
	- apps/mobile (Expo app)
	- packages/shared (shared types, validation, constants)
- Keep business logic in services.
- Use modular design: split the app into self-contained components/modules and avoid large, highly coupled files.
- Expose REST API endpoints for mobile app consumption from apps/web/src/app/api.
- Design auth to support Bearer token flows for mobile API requests.
- Prefer Server Actions only for web-specific interactions.
- Keep core domain generic and sport-agnostic.
- Implement sport-specific behavior through pluggable modules/configs (rules, scoring, ranking, scheduling).
- Keep labels/branding/theme tokens configurable to support easy app renaming and sport switching.

## Repository Policy
- Keep production code in apps/web, apps/mobile, and packages/shared.
- Keep architecture and docs self-contained in this repository.
- Implement features in TypeScript with reusable, testable modules.

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

## User Interface Guidelines
- Implement modern, responsive UI for desktop and mobile web.
- Prefer server-rendered components in Next.js for data fetching and content rendering.
- Use client components only for browser interaction and form handling.
- For mobile navigation, prefer Expo Router stack navigation patterns.
- Ensure native alert/confirm interactions have a Web fallback (for example modal popups).

## Workflow
- Work in small vertical slices: schema -> service -> API -> web screen -> mobile screen.
- Keep commits small and meaningful.
- Preserve clear commit history across multiple days for capstone scoring.

## Out of Scope for Direct Reuse
- Old runtime artifacts and logs.
- Legacy environment files and secrets.
- Copy-paste of legacy architecture patterns that conflict with capstone stack.
