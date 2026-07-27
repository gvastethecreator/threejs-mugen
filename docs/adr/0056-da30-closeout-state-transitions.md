# ADR 0056 — Closeout state transitions (DA30-006)

- **Status:** Accepted
- **Date:** 2026-07-27
- **Machine schema:** `docs/evidence/da30/closeout-state-transitions-v1.json`

## Decision

Closeouts use states: `proposed`, `active`, `blocked`, `partial`, `candidate`,
`accepted`, `superseded`, `rejected`.

**Only `accepted` advances a consecutive watermark.** Generated DA29 "closed"
rows map to `candidate` (or worse) until semantic revalidation promotes them.

Invalid transitions (must fail validators):

- `accepted` → `candidate` (use `superseded` then new work)
- `rejected` → `accepted` (re-enter `proposed`/`active`)
- `proposed` → `accepted` (skip evidence path)
- any transition from `superseded`

See the machine transition table for the full matrix.
