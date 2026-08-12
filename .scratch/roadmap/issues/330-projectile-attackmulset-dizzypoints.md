# T756 — Projectile `AttackMulSet.DizzyPoints` creation snapshot

- **Status:** closed-bounded (2026-08-12)
- **Area:** runtime / Projectile / AttackMulSet / dizzy-points resource
- **Product commit:** `76222e0f`
- **Evidence commit:** `c8c7daa1`

## Result

Fresh root Projectiles now capture the creator's finite effective
`AttackMulSet.DizzyPoints` multiplier at spawn. Accepted unguarded Projectile
hits use that immutable snapshot for the defender's dizzy-points delta while
`GetHitVar(dizzypoints)` remains the authored Projectile value. Helper-created
Projectiles use the same snapshot seam and are covered by focused unit tests.

Required root trace:

- artifact: `synthetic-imported-projectile-attack-dizzypoints-snapshot.json`
- trace checksum: `a2d32251`
- final checksum: `91bf5a3a`
- authored `dizzypoints=-20`, creation multiplier `0.5`, later live multiplier
  `2`, resulting resource `1000 -> 990`

Focused compiler/runtime/effect tests and `pnpm run typecheck` pass. The
aggregate `pnpm qa:trace` run also materializes this artifact as passed, but
the command exits non-zero on the inherited
`synthetic-imported-helper-bind-to-target-redirect` missing-target-link gate.

## Allowed claim

Root-owned fresh Projectile creation snapshots the finite effective
`DizzyPoints` multiplier and consumes it on an accepted unguarded contact;
Helper creation has equivalent focused coverage.

## Out of scope

Guarded contacts, Helper-owned durable trace breadth, ModifyProjectile,
`NoDizzyPointsDamage`, exact resource clamp/rounding/timing parity, shared
power/resource owners, teams, rollback, and full M.U.G.E.N/Ikemen parity.

## Upstream anchor

Ikemen-GO pin `149402f`: `char.go` stores `parentAttackMul` on Projectile
creation and applies `attackMul[2]` to accepted hit dizzypoints. The local
implementation intentionally keeps this bounded to the creation snapshot and
accepted unguarded contact seams above.
