# Implement TargetFacing RedirectID

Type: task
Status: resolved
Blocked by: None

## Question

Can the root-only IKEMEN RedirectID route cover TargetFacing in active CNS and
imported State -1 setup while preserving caller-owned value/ID expressions and
destination-owned target-facing mutation?

## Answer

Yes, within a bounded root-only route. Active CNS and imported State -1
`TargetFacing` now resolve a live `ikemen-go` PlayerID destination before
mutating that destination's remembered target. The caller retains authored
value and target ID context; missing RedirectID stays local and invalid or
unavailable routes fail closed.

## Evidence

- Runtime commit: `94eedd41`.
- Required active artifact/checksum:
  `synthetic-imported-target-facing-redirect` / `85d7fa7b`.
- Required State -1 artifact/checksum:
  `synthetic-imported-target-facing-state-entry-redirect` / `63d2ec84`.
- Verification: 5 affected files / 898 tests, TypeScript 7, trace syntax,
  `git diff --check`, and `pnpm qa:trace` 617/617 (583 required, 34
  optional, 0 skipped).

## Boundary

TargetBind, TargetState, helper/projectile/team ownership, exact multi-target
ordering, persistence, rollback/netplay, presentation, score, and full parity
remain future work. Next: select another independent Target* boundary.
