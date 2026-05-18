# UI References (v2-ready structure)

This folder is organized for clean reuse in the v2 rebuild.

## Structure

- `pages/`: Canonical HTML reference screens
- `assets/js/`: Reference page logic modules
- `assets/css/`: UI-only style additions
- `assets/sql/`: Canonical SQL snapshot for game lifecycle
- `archive/legacy-variants/`: Older or alternate versions kept for traceability

## Canonical choices

- HTML canonical source: `ui-references/pages/*.html`
- SQL canonical source: `database/004_game_lifecycle.sql` (copied into `ui-references/assets/sql/`)
- JS/CSS references: moved from old `ui-references/files/` into `ui-references/assets/`

## Notes

- Archived variants are intentionally excluded from active references to avoid accidental use.
- If you need to compare old/new UI behavior, diff `archive/legacy-variants/*` against `pages/*`.
