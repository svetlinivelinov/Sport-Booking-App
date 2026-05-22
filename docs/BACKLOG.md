# Backlog (Capstone-Aligned)

## Bootstrap

- [x] Initialize Next.js app in `apps/web`
- [x] Initialize Expo app in `apps/mobile`
- [x] Add shared package setup in `packages/shared`

## Backend and DB

- [x] Configure Drizzle in `apps/web`
- [x] Add first migrations for core tables
- [x] Add seed script with small + large dataset modes
- [x] Add paging params to list endpoints (`page`, `pageSize`)

## Auth and Roles

- [x] Register/login/logout routes
- [x] JWT issuance and verification middleware
- [x] Password hashing and validation policy
- [x] Admin role enforcement for privileged routes

## Core Features

- [x] Groups CRUD + membership workflows
- [x] Events CRUD + join/leave flow
- [x] Court/match progression and score submission
- [x] Results and leaderboard aggregation

## Web

- [x] Deliver first 6 web screens
- [x] Deliver admin panel screens
- [x] Reach 10+ total web screens with responsive behavior

## Mobile

- [x] Deliver login + dashboard
- [x] Deliver events/courts + booking flow
- [x] Deliver my bookings + profile
- [x] Reach 5+ total mobile screens

## Delivery

- [ ] Deploy web/backend
- [ ] Deploy Expo web export
- [ ] Add demo credentials and final docs

Delivery progress notes:
- [x] Local env validation command passing (`npm run check:web-env`)
- [x] Local smoke checks passing with explicit URLs (`npm run test:smoke -- -WebUrl http://localhost:3010 -MobileUrl http://localhost:8081`)
