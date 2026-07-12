# IKEMEN Active-root Hit-admission Promotion Research

Date: 2026-07-12
Wayfinder: 106
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

How can P3-P8 become observable direct-hit candidates without widening the pair-owned combat transaction or deriving gameplay policy from snapshots, presentation, or body-push diagnostics?

## Answer

Add a read-only runtime projection over authoritative root actors. In explicit IKEMEN Tag only, validate stable unique roots, admit valid-side player roots that are non-disabled and non-standby, sort attackers by active ReversalDef, active HitDef, then PlayerNo/id, and inspect every permitted attacker/getter pair. Record eligibility, current direct-move activity, repeated-contact rejection, HitBy/NotHitBy, required Clsn presence, and overlap. Do not call the current combat resolver.

This slice proves candidate ownership and ordering. It intentionally does not mutate guard distance, juggle, priority trade, HitOverride, reversal, life, state, hitpause, targets, effects, resources, audio, or round state.

## Source Facts

1. Character collision rejects nil animations, Clsn proxies, standby, and disabled actors before required-box and overlap checks: [Clsn checks](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10244-L10346).
2. HitBy and NotHitBy compare state/attack attributes plus optional PlayerNo/PlayerID filters; all slots determine final vulnerability: [HitBy slots](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10349-L10426).
3. Direct-hit getters and attackers independently reject standby/disabled actors, self hits, and disallowed `affectteam` relations: [player hit enrollment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13208-L13229).
4. Guard-distance observation precedes juggle, repeated-target, HitBy, depth, Clsn, and hit-result checks: [admission order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13230-L13315).
5. State/contact/hitpause/target mutation begins only after `hitResultCheck` returns a contact result: [mutation boundary](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13312-L13427).
6. Global player-hit order sorts ReversalDef first, HitDef second, then lower character ID; push runs before player hits and projectiles run after: [interaction ordering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931).

## Local Ownership

| Surface | Current truth | Wayfinder 107 decision |
| --- | --- | --- |
| Root actors | `characterRoots` owns playable plus reserves in stable runtime identity. | Sole candidate source; never snapshot/presentation/body-push ids. |
| Pair combat | `RuntimeMatchInteractionWorld` calls priority, direct, projectile, and helper resolution only for P1/P2. | Preserve exactly. Projection runs beside it and never replaces resolver input. |
| Direct admission | `RuntimeCombatResolutionWorld.resolveDirect` mixes read checks with reversal, HitOverride, guard/hit mutation, targets, effects, audio, and state entry. | Extract no resolver behavior; reuse pure geometry/HitBy primitives only. |
| Guard distance | Pair-owned and mutates defender runtime. | Blocked from projection. |
| Targets/contact | Pair-owned stores and mutation. | Read repeated-contact state only where actor-local; never remember or mark contact. |
| Capabilities | `RuntimeRootPhaseCapabilities/v3` exposes `combat=false` for P3-P8. | Add distinct `hitAdmission`; keep `combat=false`. |
| Trace | Root diagnostics are detached snapshot records. | Add exact ordered pair/reason diagnostic; exclude diagnostic text from behavior checksum. |

## Wayfinder 107 Contract

- `RuntimeRootDirectHitAdmissionWorld` accepts runtime roots plus explicit mode and current hurt-box resolver.
- It validates duplicate ids, actor aliases, valid side, and stable PlayerNo identity before producing output.
- Non-Tag returns no projection and Playable runtime does not invoke it, preserving pair behavior exactly.
- Eligible roots require player type, valid side, non-disabled, non-standby. Over-KO stays eligible because pinned player-hit enrollment does not reject it.
- Attacker order: active reversal, active direct HitDef, then numeric PlayerNo and id. Getter traversal follows the same stable root list.
- Same-side pairs reject by current default enemy-only policy. Future `affectteam` ownership replaces this bounded rule.
- Read checks cover missing/inactive/compiled/reversal-only move, `hasHit`, HitBy/NotHitBy, attack/hurt box presence, and overlap.
- Output contains all inspected pair decisions plus admitted-contact pairs. It has no callbacks and receives no mutable world services.
- Pause, hitpause, reset, and ordinary ticks clear stale diagnostics before any optional projection.

## Adversarial Audit

- Passing all roots into `resolveDirect` would immediately mutate life, state, targets, effects, audio, hitpause, and contact memory; forbidden.
- Reusing `collisionRootIds` would make presentation policy simulation authority and mishandle invisible/over-KO actors.
- Sorting by current actor array alone misses upstream ReversalDef/HitDef precedence.
- Treating missing boxes as default hurtboxes can create contact unsupported by authored Clsn. Projection requires explicit current boxes.
- Calling `canRuntimeBeHitBy` after resolver mutation would make results order-dependent. Projection snapshots checks before any pair combat resolver call.
- A diagnostic retained through pause/hitpause/reset falsely claims current admission. Clear on every tick entry and reset.

## Deletion Criteria

Promote or replace this projection when direct combat itself accepts plural actors and owns exact `affectteam`, PlayerNo/ID HitBy filters, juggle/target history, Z depth, Clsn proxies, priority trade, ReversalDef, HitOverride, guard distance, and simultaneous mutation ordering. Keep authoritative root identity, deterministic ordering, and the read/mutation boundary.

## Claim Ceiling

Allowed: source-backed implementation contract for deterministic read-only active-root direct-hit admission.

Blocked: runtime hit/guard/reversal mutation, targets, effects, throws, helpers/projectiles, resources, round/HUD/audio, scores, or full parity.

## Implementation Outcome

Wayfinder 107 implemented the read-only boundary. `RuntimeRootDirectHitAdmissionWorld` validates actor/id/positive-PlayerNo uniqueness, filters invalid/non-player/disabled/standby roots while retaining over-KO, orders attackers by active ReversalDef, active direct HitDef, then PlayerNo/id, and records every enemy pair decision through active move, repeated contact, HitBy/NotHitBy, explicit hurt Clsn, and overlap checks. `RuntimeRootPhaseCapabilities/v4` exposes `hitAdmission` independently from `combat`; snapshots, trace artifacts, and actor-scoped schedule rows carry detached `RuntimeRootDirectHitAdmission/v0` evidence.

Pair/Single combat calls remain exact. Pause, hitpause, and reset clear stale diagnostics. Focused gates pass 7 files / 764 tests; full gates pass 178 files / 1812 tests, TypeScript 7, 543/543 traces, production build, and boundaries. Runtime hit/guard/reversal mutation, targets, effects, helpers/projectiles, throws, resources, round/HUD/audio, scores, and exact parity remain blocked.
