# Wayfinder 148 - Dizzy points runtime

Type: task
Status: resolved bounded actor-local mutation
Blocked by: None

## Question

Which dizzy-point behavior can be promoted after the read-only auxiliary
resource projection without widening team banks or claiming break/HUD parity?

## Answer

Promote actor-local initialization, typed `DizzyPointsAdd`/`DizzyPointsSet`, and
explicit direct-HitDef `dizzypoints`. Use authored `[Data] dizzypoints` with life
fallback, signed attack/defence scaling, and a bounded `[0, max]` write. Keep
guarded hits, default formulas, suppression, break transitions, sharing,
reset, persistence, and presentation as separate gates.

## Evidence

- Full suite: 201 files / 2061 tests.
- TypeScript 7 and 280-module production build passed.
- `pnpm qa:trace`: 590/590 artifacts, 556 required / 34 optional.
- Required `synthetic-imported-dizzypoints` checksum: `00d3b052`.
- Boundary, CSS, and diff checks passed; browser smoke N/A.
- Research: `docs/research/2026-07-14-dizzy-points-runtime.md`.
- Report: `docs/reports/2026-07-14-dizzy-points-runtime.md`.

## Claim boundary

Allowed: bounded actor-local state, Add/Set, explicit direct-HitDef amount,
signed scaling, Helper plumbing, projection, and trace evidence.

Blocked: omitted defaults, `NoDizzyPointsDamage`, `AttackMulSet DizzyPoints`,
break transitions, team/projectile sharing, reset/persistence, HUD bars,
rollback/netplay, and full MUGEN/IKEMEN parity.
