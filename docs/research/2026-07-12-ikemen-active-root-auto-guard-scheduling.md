# IKEMEN Active-root Automatic Guard Scheduling

Date: 2026-07-12

## Question

What is the smallest evidence-backed route for automatic guard start on plural active Tag roots without changing the established P1/P2 path or claiming full IKEMEN team guard parity?

## Answer

Use the existing two automatic-guard checkpoints for `active-motion` roots, but populate their prior-tick `InGuardDist` latch from every locally eligible opposing active root after body push and before hit admission. The active-root refresh is direct physical HitDef only. It stores the first stable candidate as diagnostics, while guard-start observes the latch as a boolean because upstream `inguarddist` is a boolean flag, not a selected-attacker relation.

## Primary Sources

- [Elecbyte MUGEN 1.1 Trigger Reference: InGuardDist](https://www.elecbyte.com/mugendocs-11b1/trigger.html#InGuardDist): `InGuardDist` is true for physical or projectile guard distance, false when the opponent is not attacking or is out of range.
- [Elecbyte State Controller Reference: HitDef guard.dist](https://www.elecbyte.com/mugendocs/sctrls.html#HitDef): `guard.dist` is the x-distance in which P2 enters guard while holding away; `AttackDist` affects it only during attack move type.
- [IKEMEN-GO pinned `actionPrepare`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11610): the hardcoded guard-start route reads `c.inguarddist` before normal controller execution.
- [IKEMEN-GO pinned `actionRun`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11810): the runtime repeats the guard-start route after controller execution.
- [IKEMEN-GO pinned `actionFinish`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11998-L12025): it clears `c.inguarddist` before hit detection repopulates it.
- [IKEMEN-GO pinned player hit detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13145-L13525): direct/player and projectile detection set `getter.inguarddist = true` when guard bounds overlap.

## Local Findings

- `RuntimeMatchActorAdvanceWorld` already owns pre-controller root checks and post-controller root checks but currently limits both to `playable` roots.
- `RuntimeMatchInteractionWorld` already applies Pair P1/P2 guard-distance refresh after body push and before hit admission.
- `RuntimeRootSelectionWorld` exposes stable `p2CandidateIds`: active, opposing, player-root candidates that are not over-KO. It does not rank by distance.
- `RuntimeGuardDistanceWorld.isInGuardDistance` already provides direct, guardability-aware geometry. Its `refreshLatch` adds projectile behavior, so active-root work must call the direct primitive instead.
- Current latch metadata has an attacker id, but current `InGuardDist` trigger semantics do not need an attacker relation. Retain it only for trace diagnostics.

## Selected Boundary

1. In explicit Tag normal ticks, refresh each `active-motion` root against all its `p2CandidateIds` after body push.
2. Select the first candidate whose direct `RuntimeGuardDistanceWorld.isInGuardDistance` result is true; otherwise clear the active-root latch.
3. Run the existing pre/post auto-guard checkpoints for `active-motion`, with that active-root guard path evaluating latch presence rather than the passed Pair-style opponent id; preserve selected-attacker evaluation for Pair/Single and generic `InGuardDist` triggers.
4. Recheck a root's current active-motion phase before post guard and latch refresh; clear a root that changed to standby. Clear active-root latches before actual hitpause ignored controllers and before paused reserve CNS, while preserving the ordinary normal-tick hitpause branch probe, so Pause/hitpause cannot reuse a stale normal-tick observation.

## Deliberate Limits

- No active-root projectile or helper guard-distance refresh.
- No claim that stable root order equals IKEMEN nearest-target or plural target precedence.
- No Pause/hitpause auto-guard execution for active roots.
- No guard contact, guard effect, AI, direct input, replacement, or HUD extension.

## Proof Plan

Required trace places P3 at a side-one start, P2 far outside guard distance, and active P4 within P3's direct guard distance but outside collision. Side-one held-back input routes to P3. The trace must prove P3 enters `120` then `130`, records P4 as the diagnostic latch source, does not hit or guard-contact any actor, and contains the new P3 pre/post auto-guard schedule phases.

## Result

Implemented as planned and hardened after independent review. `synthetic-imported-ikemen-active-root-auto-guard` now passes at trace checksum `5e0aaf61` / final `0221a0e8`, inside `pnpm qa:trace` `569/569` artifacts (`538` required). The route proves P3 sees P4 as direct latch provenance while P2 authors a guardable direct HitDef but stays out of range, enters `120`, then settles in `130` without combat contact. The evidence does not establish plural target ranking, projectiles, helpers, Pause/hitpause, or guard-contact parity.
