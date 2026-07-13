# Active-root Automatic Guard Report

Date: 2026-07-12
Area: IKEMEN active-root runtime scheduling

## Delivered

- Active-motion roots now enter the existing pre-controller and post-controller automatic guard passes.
- Post-fighter interaction refreshes direct-only plural root guard distance after body push and before hit admission.
- The runtime considers local eligible opposing roots in stable diagnostic order and records the first direct match for trace provenance. Only active-motion automatic guard consumes this latch as a boolean; Pair/Single guard and generic `InGuardDist` retain selected-attacker identity.
- Actual HitPause and match Pause clear reserve-root latches before their permitted CNS paths. A root that tags out during its active controller pass is rechecked before post-fighter guard refresh, so standby CNS cannot inherit its stale latch.
- `activeRootHitDefRoute` can author bounded `guard.dist` in the synthetic compatibility fixture.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-auto-guard.json`.
- Trace checksum: `5e0aaf61`; final checksum: `0221a0e8`.
- Three frames prove P2 authors a guardable direct HitDef while remaining out of range, P4 is P3's direct latch provenance, held side-one back reaches P3, P3 enters `120`, then settles in `130` at life `1000`, and no hit/guard/override contact occurs.
- `pnpm vitest run src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts src/tests/RuntimeMatchActorAdvanceSystem.test.ts src/tests/RuntimeMatchPostFighterSystem.test.ts src/tests/MatchInteractionSystem.test.ts`: `760/760` passed.
- `pnpm qa:trace`: `569/569` artifacts passed, `538` required.
- `pnpm test`: `183` files / `1944` tests passed.
- `pnpm typecheck` and `pnpm check:boundaries` passed.
- `pnpm build` passed; Vite retains the existing `1.66 MB` minified JavaScript chunk advisory.

## Audit

The first focused run exposed a real phase-snapshot scope error that blocked all active-root traces. The repair passes the immutable normal-tick active-root set into post-fighter refresh. Trace inspection then rejected two weak gate assumptions: it required one actor instead of the observed full root pass, and it expected a final-reserve standby property not present in that snapshot. Both gates now observe the actual runtime artifact.

A later stale-latch audit found that `RuntimeMatchTickBranchWorld` invokes the hitpause callback on every tick as a branch probe. An unconditional clear there erased normal-tick active-root latches before automatic guard ran. The repair clears only when P1 or P2 has real hitpause, before ignored controllers execute; ordinary match pause still clears before paused reserve CNS. The focused regression covers both the normal P3 guard route and the paused stale-latch trap.

Independent read-only review then raised four concrete objections. The Pair path and generic trigger no longer widen to arbitrary latch provenance: they require the selected attacker, while active-motion automatic guard alone consumes the plural boolean latch. Post-fighter refresh rechecks that a root remains active-motion and clears a root that tagged out during its own controller pass. The required trace now makes P2 attack with a guardable direct HitDef while remaining out of range, so P4 provenance proves the plural candidate scan rather than merely P2 inactivity. A HitPause regression now seeds and verifies removal of a reserve latch as well as the existing Pause trap.

## Claim Allowed

Bounded direct physical guard-distance observation and imported automatic guard-state entry for active-motion roots during normal explicit IKEMEN Tag ticks.

## Claim Blocked

Projectile/helper threats, nearest-target or plural target precedence, Pause/hitpause, guard contact/effects, guard variants, team replacement/KO, HUD/audio/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: direct active-root guard scheduling now has one required no-contact trace.
- Studio/editor: unchanged.
- Modular boundary: post-fighter root guard refresh is explicit; no score movement.
