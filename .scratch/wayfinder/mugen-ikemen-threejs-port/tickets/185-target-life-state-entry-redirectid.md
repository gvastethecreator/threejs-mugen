# Implement TargetLifeAdd state-entry RedirectID

Status: resolved bounded slice.
Date: 2026-07-15

## Contract

Imported State -1 `TargetLifeAdd` supports IKEMEN root `RedirectID` under the
`ikemen-go` profile. Redirect expression resolves from caller context, then a
live root PlayerID destination applies the typed life operation to its own
remembered target. Missing redirects remain local. Invalid, negative,
unavailable, disabled, destroyed, malformed, and legacy routes fail closed.

## Evidence

- Commit: `d4ef5c3a`.
- Required artifact/checksum: `synthetic-imported-target-life-state-entry-redirect` /
  `2e4c8c1b`.
- Target links: `p1 -> p2 / 77` and `p2 -> p1 / 77`.
- Final life: `p1 = 1000`, `p2 = 980`; target count `1` each.
- Verification: 4 affected files / 867 tests, TypeScript 7, trace syntax,
  `git diff --check`, and `pnpm qa:trace` 613/613 (579 required, 34 optional,
  0 skipped).

## Boundary

Active-state TargetLifeAdd is closed separately. Helpers, projectiles, teams,
exact multi-target ordering, other Target* families, persistence,
rollback/netplay, presentation, score, and full parity remain future work.
