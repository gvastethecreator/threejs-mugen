# TargetLifeAdd RedirectID

Status: resolved bounded slice.
Date: 2026-07-15

## Contract

Imported active CNS `TargetLifeAdd` supports IKEMEN root `RedirectID` under the
`ikemen-go` profile. Redirect expression resolves from caller context, then the
live root PlayerID destination applies the typed life operation to its own
remembered target. Missing redirects remain local. Invalid, negative,
unavailable, disabled, destroyed, malformed, and legacy routes fail closed.

## Evidence

- Commit: `057572d0`.
- Required artifact/checksum: `synthetic-imported-target-life-redirect` /
  `74f63e7d`.
- Target links: `p1 -> p2 / 77`, `p2 -> p1 / 77`.
- Final life: `p1 = 980`, `p2 = 1000`; target count `1` each.
- Verification: 3 affected files / 860 tests, TypeScript 7, trace syntax,
  `git diff --check`, and `pnpm qa:trace` 612/612 (578 required, 34 optional,
  0 skipped).

## Boundary

State-entry, helpers, projectiles, teams, exact multi-target ordering,
persistence, rollback/netplay, presentation, score, and full parity remain
future work.
