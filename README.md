# Sport Booking App v1

Multi-sport booking platform delivered as a capstone monorepo with:

- Next.js web app and REST backend
- Expo mobile app (native + web)
- Neon PostgreSQL via Drizzle ORM
- JWT authentication with role-based access

This repository is beyond starter scaffolding and includes implemented screens, APIs, migrations, services, and seed tooling for scale validation.

## Project Status

Current state: functional v1 baseline ready for review/demo.

- Web screens implemented: 11
- Mobile screens implemented: 7
- API route handlers implemented: 18
- Relational tables implemented: 8
- Seed supports large data mode for paging/perf checks (10k+ related rows)

## Architecture Block Schema

```mermaid
flowchart LR
  U[Web User] --> W[Next.js Web UI]
  M[Mobile User] --> X[Expo Mobile App]

  W --> A[Next.js REST API
  apps/web/src/app/api]
  X --> A

  A --> S[Service Layer
  apps/web/src/services]
  S --> D[Drizzle ORM]
  D --> N[(Neon PostgreSQL)]

  P[Shared Contracts
  packages/shared] --> W
  P --> X
  P --> A
```

## Database Block Schema

```mermaid
erDiagram
  USERS ||--o{ GROUPS : owns
  USERS ||--o{ GROUP_MEMBERS : joins
  USERS ||--o{ SESSIONS : creates
  USERS ||--o{ SESSION_PARTICIPANTS : participates
  USERS ||--o{ SCORE_ENTRIES : submits

  SPORTS ||--o{ GROUPS : categorizes
  SPORTS ||--o{ SESSIONS : categorizes

  GROUPS ||--o{ GROUP_MEMBERS : has
  GROUPS ||--o{ SESSIONS : hosts

  SESSIONS ||--o{ SESSION_PARTICIPANTS : has
  SESSIONS ||--o{ MATCHUPS : has

  MATCHUPS ||--o{ SCORE_ENTRIES : receives

  USERS {
    uuid id PK
    string email
    string role
  }

  SPORTS {
    uuid id PK
    string slug
    string name
  }

  GROUPS {
    uuid id PK
    uuid sport_id FK
    uuid owner_user_id FK
  }

  GROUP_MEMBERS {
    uuid group_id FK
    uuid user_id FK
    string role
  }

  SESSIONS {
    uuid id PK
    uuid sport_id FK
    uuid group_id FK
    uuid created_by_user_id FK
    string status
    datetime starts_at
  }

  SESSION_PARTICIPANTS {
    uuid session_id FK
    uuid user_id FK
    string status
  }

  MATCHUPS {
    uuid id PK
    uuid session_id FK
    int round_number
    int slot_number
    string status
  }

  SCORE_ENTRIES {
    uuid id PK
    uuid matchup_id FK
    uuid submitted_by_user_id FK
    json score_payload
  }
```

## Repository Layout

```text
apps/
  web/                 Next.js app + REST API + Drizzle schema/migrations
  mobile/              Expo app (native + web)
packages/
  shared/              Shared domain types, constants, validation, theme
docs/                  Plan, backlog, deployment, domain model
scripts/               Env and smoke test automation
```

## Implemented Feature Surface

### Web (Next.js)

- Landing, login, signup, dashboard
- Groups, events, my sessions, court flow
- Results, profile, admin

### Mobile (Expo)

- Login
- Dashboard
- Events
- Groups
- My sessions
- Results
- Profile

### REST API (apps/web/src/app/api)

- Auth: login, register, logout, me
- Sports, groups (+ membership), sessions (+ status/finalize/participants), matchups (+ scores/status), results, health

## Tech Stack

- Frontend web: Next.js 16, React 19, Tailwind CSS 4
- Mobile: Expo 54, React Native 0.81
- Backend: Next.js API routes, service modules
- Database: PostgreSQL (Neon) + Drizzle ORM
- Auth: JWT + bcryptjs
- Shared package: workspace package for cross-platform contracts

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure Environment

Create apps/web/.env with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
JWT_SECRET=replace-with-strong-random-secret
```

Optional for deployed CORS flows:

```env
CORS_ALLOWED_ORIGINS=https://your-mobile-web-domain.example.com
```

For mobile, copy and adjust apps/mobile/.env.example:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3010
```

### 3. Run Apps

Web only:

```bash
npm run dev:fresh
```

Web + mobile web:

```bash
npm run dev:all:fresh
```

Default local URLs:

- Web: http://localhost:3010
- Mobile web: http://localhost:8090

### 4. Database and Seed

```bash
npm run check:web-env
npm run db:migrate
npm run db:seed:small
npm run db:seed:large
```

### 5. Smoke Validation

```bash
npm run test:smoke
```

## Reviewer Checklist

Use these commands when inspecting project completeness:

```bash
git status
npm install
npm run check:web-env
npm run db:migrate
npm run db:seed:small
npm run dev:fresh
npm run test:smoke
```

Then verify:

- Web pages load and authenticate
- Mobile web starts and calls API
- /api/health responds
- Sessions list paging works with seeded data

## Capstone Alignment Snapshot

- 10+ web screens: met
- 5+ mobile screens: met
- 4+ related DB tables: met (8 implemented)
- Role-based auth and protected behavior: implemented
- Seed and large dataset support: implemented
- Deployment runbook: docs/DEPLOYMENT.md

## Primary Documentation

- Implementation plan: docs/IMPLEMENTATION_PLAN.md
- Screen scope: docs/SCREEN_INVENTORY.md
- Domain model: docs/DOMAIN_MODEL.md
- Deployment runbook: docs/DEPLOYMENT.md
- Agent/project rules: AGENTS.md and .github/copilot-instructions.md
