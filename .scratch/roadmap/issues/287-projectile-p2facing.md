# Issue 287 — Projectile `p2facing` after accepted hit

## Status

Closed-bounded as T713 on 2026-08-11.

## Contract

M.U.G.E.N 1.1 documents `p2facing` as a HitDef parameter: `+1` makes P2
face the same direction as P1 after a successful hit, `-1` makes P2 face
away, and `0` leaves the facing unchanged. Projectiles inherit HitDef
parameters. See `.scratch/external/mugen-1.1b1/docs/sctrls.html` at the
HitDef `p2facing` and Projectile parameter sections.

Pinned Ikemen GO revision `149402f` evaluates Projectile `p2facing` on the
Projectile HitDef and, on `Abs(hitResult) == 1`, derives the target facing
from the Projectile facing before consuming the one-shot latch in the next
actor update (`src/char.go` around the contact-facing and `setFacing` paths;
`src/bytecode.go` around the `hitDef_p2facing` Projectile branch).

The local runtime now stores `pendingProjectileHitFacing` only for an
accepted unguarded Projectile hit, derives `+1`/`-1` from the Projectile's
actual facing, and consumes the latch at frame start after automatic facing.
`GetHitVar(facing)` remains the authored Projectile value.

## Evidence

- `ProjectileCombatSystem.test.ts`: hit applies the one-shot latch in both
  directions; guard contacts do not create or consume it.
- Required trace:
  `synthetic-imported-projectile-p2facing` — gate added to
  `RuntimeTraceGatePresets` and `scripts/qa_traces.cjs`. It proves Projectile
  spawn/active lifecycle, accepted hit, target link, authored
  `GetHitVar(facing)=1`, and the frame where P2 changes from `-1` to `+1`.

## Allowed claim

Root-owned fresh Projectiles apply static `p2facing` on accepted unguarded
hits through the local deferred-facing seam, with hit metadata and required
trace evidence.

## Out of scope

Projectile `p2facing` expressions in caller context, Helper-parented
Projectiles, `ModifyProjectile`, `p1facing`, ReversalDef, guard contacts,
HitOverride/reversal arbitration, `noautoturn` interaction, exact
actionRun/tick parity, custom-state ownership, teams, rollback, and full
M.U.G.E.N/Ikemen parity remain open.
