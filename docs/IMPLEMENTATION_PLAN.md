# High-Level Implementation Plan

## Phase 1: Monorepo and Tooling

1. Initialize `apps/web` (Next.js + TypeScript + Tailwind).
2. Initialize `apps/mobile` (Expo + TypeScript).
3. Configure monorepo scripts and shared TypeScript config.
4. Keep agent instruction files aligned (`AGENTS.md`, `.github/copilot-instructions.md`).

## Phase 2: Data Model and Infrastructure

1. Configure Neon PostgreSQL connection.
2. Set up Drizzle ORM and migration workflow.
3. Create baseline schema (users, sports, groups, sessions/events, participants, matchups, results).
4. Create seed script and large data generation mode (10,000+ records).

## Phase 3: Multi-Sport Domain Layer

1. Define sport-agnostic core entities and naming conventions.
2. Implement sport configuration model (team size, scoring model, ranking model, scheduling strategy).
3. Create pluggable rule modules for at least one starter sport and one additional sport.
4. Keep UI labels and branding configurable for easy renaming/re-theming.

## Phase 4: Auth and Authorization

1. Register, login, logout endpoints.
2. Password hashing (bcrypt/argon2) and JWT issue/verify.
3. Role model (`user`, `admin`) and access enforcement in API + middleware.
4. Support Bearer token flow for mobile REST API clients.

## Phase 5: Core Product Features

1. Groups and memberships.
2. Event creation and participation.
3. Game lifecycle and score entry via sport-aware rule modules.
4. Results and leaderboard views.

## Phase 6: Web App Delivery

1. Deliver at least 10 web screens.
2. Implement reusable components and responsive design.
3. Build admin panel for privileged workflows.
4. Add clear visual cues (icons/effects/states) for UX clarity.

## Phase 7: Mobile App Delivery

1. Deliver at least 5 mobile screens.
2. Integrate mobile app with REST endpoints.
3. Focus on core end-user flows (exclude complex admin flows).

## Phase 8: Performance and Scalability

1. Implement server-side paging for list APIs and UI screens.
2. Validate behavior with large seeded data.
3. Add indexes based on query profiling.

## Phase 9: Deployment and Submission

1. Deploy Next.js web/backend.
2. Deploy Expo web export.
3. Add demo credentials.
4. Finalize README, architecture docs, and API notes.
5. Maintain commit cadence for capstone scoring requirements.
6. Publish required metadata in `docs/Capstone.md` (repo URL, live URLs, test credentials, author details).
7. Verify capstone Git history thresholds (minimum 15 commits across at least 3 different days).
8. Ensure documentation explicitly includes DB schema relationships and local setup steps.

## Phase 10: Optional Bonus Scope

1. Object storage file upload/download flow (for example Cloudflare R2).
2. Automated tests and GitHub Actions execution.
3. Automated backup workflow for DB/storage snapshots.

## Technical Spec Addendum: Sport-Driven Participant Capacity

### Goal

Replace hardcoded participant assumptions with sport-configured capacity rules that apply consistently across DB, API, web, and mobile.

### Scope

1. Define sport-level default participant capacity.
2. Snapshot capacity at session creation time.
3. Enforce capacity in join flow with concurrency safety.
4. Expose capacity fields to clients and remove UI hardcoding.
5. Align seed behavior with sport config.

### Proposed Data Model

1. Keep sport as default source of truth:
	- Option A: derive from existing `teamSize` (for two-side sports, max participants = teamSize * 2).
	- Option B: explicit `rulesConfig.maxParticipants` for sport-specific override.
2. Add `sessions.maxParticipants` as a required snapshot field.
3. Backfill existing sessions during migration using sport defaults and controlled fallback.

### API and Service Behavior

1. On session creation:
	- Resolve default capacity from selected sport.
	- Persist resolved value to `sessions.maxParticipants`.
2. On join session:
	- Count active participants.
	- Reject with `409` when full.
	- Execute check and insert in a transaction to prevent race overbooking.
3. On session list/detail responses:
	- Return `participantCount`, `maxParticipants`, `remainingSlots`, and `isFull`.

### UI Behavior (Web and Mobile)

1. Show `Participants: X / Y` using API data.
2. Disable or hide join action when `isFull`.
3. Show a clear full-capacity reason when join is blocked.
4. Remove any hardcoded participant limits from components.

### Seed and Test Updates

1. Seed generator should derive participants-per-session from sport config, not a fixed number.
2. Add coverage for at least:
	- Padel capacity rule (4)
	- Tennis capacity rule (2)
	- Football capacity rule (8)
3. Add concurrent join scenario validating overbooking does not occur.

### Rollout Sequence

1. Ship migration adding `sessions.maxParticipants` and backfill.
2. Ship API enforcement and response shape updates.
3. Ship web and mobile UI updates consuming new fields.
4. Run large-seed validation and smoke tests.

### Acceptance Criteria

1. Participant limits are no longer hardcoded in UI or seed script.
2. Join requests cannot exceed session capacity under concurrent load.
3. Session capacity reflects sport configuration at creation time.
4. Existing sessions remain valid after migration.
5. Web and mobile both render the same participant-capacity behavior.
