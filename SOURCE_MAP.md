# Source Map for Padel v2 Support Folder

Purpose: help AI agents reuse domain knowledge from Support Folder without copying old architecture.

How to use:
- Keep these files read-only in a support folder (for reference).
- Re-implement features in the new monorepo stack (Next.js + Drizzle + Neon + Expo).
- Do not copy secrets or runtime artifacts.

## Reuse Table

| Source file / folder | What it contains | How to reuse in v2 |
|---|---|---|
| NEW CAPSTONE.md | Official capstone requirements and scoring criteria | Use as acceptance checklist and milestone definition for all major tasks |
| NEW Project.md | Gap analysis of current app vs capstone | Convert each gap into backlog tasks for v2 planning |
| README.md | Existing project context, setup notes, feature summary | Reuse project narrative and setup hints; rewrite for new monorepo structure |
| App Redesign.md | UI/UX redesign ideas | Reuse layout and interaction concepts; implement as React components |
| App Redesign final.md | Refined UI direction | Reuse final UI decisions for v2 design consistency |
| App Redesign Colors.md | Color palette and visual style notes | Map to Tailwind theme tokens in v2 |
| App Refactoring.md | Refactoring observations and known pain points | Use to avoid old anti-patterns and decide cleaner module boundaries |
| Game Types.md | Domain definitions for game modes and formats | Recreate enums/types and validation rules in shared package |
| Styles GPT.md | Styling ideas and component-level style guidance | Reuse as design input, not as direct CSS copy |
| Styles Claude.md | Alternate styling prompts and UI guidance | Use as optional design variants for components/screens |
| Theme GPT.md | Theme strategy and visual system notes | Convert into design tokens and global styles in web/mobile |
| supabase/migrations/001_init.sql | Initial schema baseline | Use for domain understanding; recreate schema via Drizzle models + migrations |
| supabase/migrations/002_security_hardening.sql | Security hardening patterns | Apply equivalent auth/authorization constraints in v2 APIs and DB |
| supabase/migrations/003_fix_rls_recursion.sql | RLS recursion fixes and lessons | Reuse as caution when implementing role checks / policies |
| supabase/migrations/004_game_lifecycle.sql | Game lifecycle rules at DB level | Port lifecycle logic to services + DB constraints in v2 |
| supabase/migrations/005_event_location_notes.sql | Event metadata adjustments | Reuse event-related fields and validation requirements |
| supabase/migrations/006_user_roles_and_admin_seed.sql | Roles model and admin seed ideas | Recreate user/admin roles and seed approach in Drizzle seed scripts |
| supabase/migrations/007_harden_admin_seed_matching.sql | Admin seed safety refinements | Reuse matching safety logic in secure seeding process |
| supabase/migrations/008_admin_console_rpcs.sql | Admin operations represented as RPC | Reimplement as typed REST endpoints and service methods |
| supabase/migrations/009_fix_admin_rpc_return_types.sql | Return-type corrections for admin operations | Use to design strict response contracts and DTOs |
| supabase/migrations/010_admin_delete_event_rpc.sql | Event deletion admin workflow | Port business rules to admin API/service route |
| supabase/migrations/011_admin_finalize_event_rpc.sql | Event finalization workflow | Implement finalization state transitions with role checks |
| supabase/migrations/012_admin_test_game.sql | Test-game/admin helper logic | Reuse as QA scenario and seed/test fixtures |
| supabase/migrations/013_game_format.sql | Game format evolution and constraints | Rebuild as normalized table fields + constraints |
| files/004_game_lifecycle.sql | Standalone lifecycle SQL reference | Use as quick reference while implementing state machine logic |
| files/database_additions.js | Extra DB helper logic/prototypes | Extract useful rules; rewrite in TypeScript service layer |
| public/assets/js/auth.js | Existing auth flow behavior | Reuse UX flow and validation ideas; re-implement with JWT backend |
| public/assets/js/court.js | Court listing/details interactions | Recreate court queries and UI behaviors in web/mobile screens |
| public/assets/js/events.js | Event lifecycle and event-page behavior | Port event orchestration logic to service + API handlers |
| public/assets/js/results.js | Match result handling behavior | Rebuild score submission and display flow with typed API |
| public/assets/js/profile.js | Profile page logic and user actions | Reuse profile fields and update flow in web/mobile |
| public/assets/js/groups.js | Group management logic | Recreate grouping features with proper access control |
| public/assets/js/notifications.js | Notification behavior patterns | Re-implement notifications with clean abstraction layer |
| public/assets/js/admin.js | Admin actions and dashboard logic | Convert into secure admin routes + web admin panel components |
| public/ (all HTML pages) | Existing page-level UX and navigation references | Use as screen inventory to map required 10+ web screens |
| files/ (HTML/CSS/JS prototypes) | Prototype-level flows and UI snippets | Use as inspiration and edge-case references only |

## Do Not Reuse Directly

| Source file / folder | Why not | Safer alternative |
|---|---|---|
| .git/ | Repository history metadata, not project source | Start clean v2 repo with fresh commit history |
| .server.pid | Runtime artifact | Exclude from support folder |
| .server.stdout.log | Runtime artifact/log noise | Exclude from support folder |
| .server.stderr.log | Runtime artifact/log noise | Exclude from support folder |
| public/assets/js/env.js | Can contain environment-specific values | Keep only empty template; set real values via environment variables |

## Suggested Support Folder Layout in v2

```text
support/
  requirements/
    NEW CAPSTONE.md
    NEW Project.md
  product/
    App Redesign.md
    App Redesign final.md
    App Redesign Colors.md
    App Refactoring.md
    Game Types.md
    Styles GPT.md
    Styles Claude.md
    Theme GPT.md
  database/
    migrations/ (copied from v1 as references)
    004_game_lifecycle.sql
    database_additions.js
  logic-references/
    auth.js
    court.js
    events.js
    results.js
    profile.js
    groups.js
    notifications.js
    admin.js
  ui-references/
    public/ snapshots
    files/ prototypes
  SOURCE_MAP.md
```
