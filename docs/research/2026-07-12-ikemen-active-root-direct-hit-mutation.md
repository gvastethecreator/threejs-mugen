# IKEMEN Active-root Direct-hit Mutation Research

Date: 2026-07-12
Wayfinder: 108
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Can one admitted P3-P8 direct contact safely reuse the current mutation resolver now, and if not, what prerequisite removes the highest-risk ownership alias?

## Answer

Not yet. The direct resolver is generic over actor type and reserve fighters already carry actor-local runtime, contact, target arrays, state data, and event arrays. However `RuntimeEffectActorWorld` still owns exactly two stores and maps arbitrary actor ids through a P1/P2 owner key. A reserve getter entering `applyResolvedHit` can therefore remove effects from the wrong root; a reserve attacker can route future effects/projectiles/helpers into another player's store. Promote exact root-key effect stores first. Keep hit admission read-only until that gate lands.

## Source Facts

1. Vulnerability resolves hitflags, falling/guard state, HitBy/NotHitBy PlayerNo/ID filters, and counter-hit priority before result mutation: [hittable and priority policy](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10488-L10616).
2. `hitResultCheck` handles existing state changes, throws, combo state, guard selection, HitOverride, and P1/P2 state ownership inside one mutation transaction: [result transaction](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10619-L10815).
3. A successful non-projectile result buffers the target id before GetHitVars mutation: [target buffer boundary](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10815-L10835).
4. Buffered HitDef targets commit later during character update to reduce processing-order errors: [deferred target commit](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12312-L12333).
5. Global detection sorts ReversalDef, HitDef, then ID and resolves each getter in that order: [global detection order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931).

## Local Ownership Audit

| Surface | Ready | Blocker |
| --- | --- | --- |
| Admission | `RuntimeRootDirectHitAdmission/v0` supplies ordered read-only pair decisions. | Exact affectteam/juggle/depth/proxy policy remains incomplete. |
| Direct resolver | Generic `RuntimeCombatResolutionWorld.resolveDirect` accepts any complete fighter actor. | Mixes reversal, HitOverride, target, state, resource, effect, audio, and contact mutation. |
| Runtime/state | Reserve `FighterMatchState` owns life, state, hitpause, contact, targets, and definitions. | Active-motion allowlist cannot author HitDef yet. |
| Targets | Each fighter has target arrays and shared stateless `RuntimeTargetWorld`. | Post-fighter target aging/binding still advances P1/P2 only; upstream uses deferred target buffers. |
| Effects | `RuntimeEffectActorWorld` stores only `p1` and `p2`; `RuntimeMatchActorRosterWorld.effectStoreOwners` is pair-only. | P3-P8 owner ids can alias a pair store. This is P1 data corruption risk. |
| Presentation/audio | Actor event arrays exist, but snapshot/HUD/audio consumers remain pair-oriented. | Real reserve contact could be invisible or attributed incorrectly. |
| Round/resources | Resolver mutates actor life/power; round winner/KO owners remain pair-only. | A reserve KO cannot yet drive correct team round policy. |

## Wayfinder 109 Contract

- Replace two-key effect storage with an actor-keyed registry whose initial P1/P2 compatibility surface remains stable.
- Match construction registers all authoritative roots before any spawn or combat query.
- Unknown owner ids throw; no fallback to P1 or P2.
- Every store operation resolves exact owner: helper/projectile/explod spawn, listing, counts, remove-on-gethit/contact, advance, snapshot, summarize, and reset.
- Preserve global Helper run-order identity and per-owner serial determinism.
- Keep effect advancement, projectile/helper combat, presentation, and capability widening pair-only in this cut.
- Add P3/P4 isolation and reset evidence plus full trace regression.

## Adversarial Audit

- Calling the generic resolver now is unsafe even when visual emission is suppressed: `applyResolvedHit` removes get-hit explods through the aliased effect world.
- Special-casing P3 to P1's store formalizes corruption and prevents later exact owner accounting.
- Adding reserve stores without registering every lookup leaves silent fallback paths. Unknown owners must fail closed.
- Widening effect advancement together with storage obscures whether ownership or lifecycle caused regressions. Storage first, consumers later.
- Targets are the next blocker after stores: local arrays exist, but aging/binding and deferred commit order remain pair-only.

## Deletion Criteria

The root-key registry is final ownership infrastructure, not a temporary shim. Remove P1/P2 key conversion only after every caller uses exact actor ids and compatibility summaries retain stable labels without fixed storage assumptions.

## Claim Ceiling

Allowed: source-backed prerequisite and implementation-ready root-key effect-store contract.

Blocked: active-root direct mutation, plural effect lifecycle/combat/presentation, target parity, round/HUD/audio, scores, or full parity.

## Implementation Outcome

Wayfinder 109 is resolved. `RuntimeEffectActorWorld` now uses exact actor-keyed stores, match construction registers every authoritative root, unknown owners fail closed, reset covers every unique store, and Helper get-hit cleanup resolves through the root owner. Registry and trace summaries now expose P1-P8 stores while effect advancement, presentation, projectile/helper combat, and direct hit mutation remain pair-owned.

The next prerequisite is Wayfinder 110: actor-keyed target aging, binding, acquisition buffering, and deferred commit. Direct P3-P8 mutation remains blocked until that lifecycle has an exact schedule and regression evidence.
