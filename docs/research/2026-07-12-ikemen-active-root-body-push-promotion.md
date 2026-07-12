# IKEMEN Active-root Body-push Promotion Research

Date: 2026-07-12
Wayfinder: 104
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

How can active P3-P8 Tag roots join physical body push without making snapshot storage, diagnostic collision ids, or pair combat authority implicit gameplay policy?

## Answer

Add a runtime-owned plural body-push projection. Outside explicit Tag, preserve the current P1/P2 call exactly. In explicit Tag, build one stable actor-order list from runtime roots, validate unique ids, admit valid-side player roots that are non-disabled and non-standby, then resolve each unordered pair once through current facing-aware X/Width separation and re-clamp all admitted roots.

This is deliberately stronger than repeatedly calling pair push only for P3/P2: all active same-side and cross-side roots participate. It remains a bounded compatibility layer, not exact IKEMEN push. Current runtime lacks size-box state classes, Y/Z depth, `pushAffectTeam`, `pushPriority`, weight, pushfactor, localcoord, and interpolation ownership.

## Source Facts

1. Push rejects a getter when `PlayerPush` is off, standby, or disabled, and applies the same filter to every run-order candidate: [push enrollment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13632).
2. Same-side and enemy push use asymmetric `AffectTeam` policy: [team policy](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13634-L13646).
3. Push uses the first current size box, local scale, Y overlap, facing-aware X overlap, and Z depth: [geometry](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13648-L13736).
4. Priority, weight, and pushfactor determine displacement; position ties use priority/movetype/height/facing policy: [resolution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13738-L13837).
5. X movement is screen-bound and interpolation state is updated after push: [reclamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13839-L13845).
6. Global interaction order runs push before player and projectile hit detection: [interaction order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13932).

## Local Ownership

| Surface | Current | Wayfinder 105 decision |
| --- | --- | --- |
| `RuntimeActorConstraintWorld.separate` | Pair-only, X/Width, symmetric, `PlayerPush` gate. | Keep primitive; do not inflate it with roster policy. |
| `RuntimeMatchInteractionWorld` | P1/P2 push before targets/combat. | Accept optional plural push callback at same order point. |
| Root storage | P1/P2 plus `reserveRoots` in explicit runtime order. | Runtime supplies ordered roots; snapshots and collision ids are not authority. |
| Root capabilities | v2 exposes generic constraints. | Bump schema; publish distinct body-push capability. |
| Stage clamp | Actor-local current sandbox X bounds. | Reapply after plural resolution. |
| Combat/effects/targets | Pair-owned post-fighter transaction. | Unchanged. |

## Wayfinder 105 Contract

- `RuntimeRootBodyPushWorld` owns eligibility, unique-id validation, stable unordered-pair traversal, separation, and final clamp.
- Legacy/unknown/Single preserve exact pair callback and behavior.
- Explicit Tag roots require valid side, player type, non-disabled, non-standby. Over-KO remains eligible because pinned push does not reject it.
- `PlayerPush = 0` remains actor-local and blocks a pair through the existing primitive.
- Same-side roots participate because current runtime has no `AffectTeam`; this divergence is explicit and tested.
- Trace requires exact admitted ids, moved P3/P2 positions, actor-scoped push phase, zero targets/effects, and no hit/guard evidence.
- Browser is N/A: deterministic runtime position/trace evidence observes the behavior; existing renderer smoke remains unaffected.

## Adversarial Audit

- Using `collisionRootIds` as push authority conflates diagnostics with gameplay and admits over-KO/visibility policy accidentally.
- Iterating `snapshot.actors` drops reserves and turns presentation storage into simulation order.
- Calling pair push only for P3 versus P2 misses P1/P3 and multi-root overlaps.
- Resolving ordered pairs twice over-separates under the current symmetric primitive; each unordered pair runs once.
- Appending roots to combat input silently grants hits, targets, guard distance, and effects; blocked.
- Exact parity cannot be claimed from X/Width-only geometry; docs and traces must retain the blocked dimensions.

## Deletion Criteria

Replace bounded X/Width separation when runtime actors own current size-box classes, localcoord, Y/Z depth, AffectTeam, priority, weight, pushfactor, and interpolation. Retain explicit plural ownership, stable actor identity, pre-combat ordering, and fail-closed validation.

## Claim Ceiling

Allowed: one implementation-ready deterministic plural active-root X/Width push boundary.

Blocked: exact IKEMEN team/geometry/priority/weight/factor/tie/corner semantics, helpers, hit/combat, throws, scores, or full parity.

## Implementation Outcome

Wayfinder 105 implemented the bounded boundary. `RuntimeRootBodyPushWorld` validates unique stable runtime roots, admits explicit-Tag player roots that are valid-side/non-disabled/non-standby, resolves each unordered pair once through current facing-aware X/Width separation, and reclamps through a post-push stage primitive. `RuntimeRootPhaseCapabilities/v3` exposes `bodyPush`; `RuntimeRootBodyPush/v0` snapshots exact roots/pairs/moved ids; actor-scoped `post-fighter:body-push` schedule evidence runs before combat. Pair/Single retain the previous callback exactly.

Required active-root motion checksum is now `fdd687cb`; active-root constraint checksum is `c4d89ec3`. Both retain zero effect stores/targets and forbidden hit/guard evidence inside 543/543 passing traces. Full gates pass 177 files / 1802 tests, TypeScript 7 build 1,611.24 kB, boundaries, and diff audit. Browser is N/A because no presentation surface changed. Exact IKEMEN AffectTeam, size-box Y/Z/localcoord, priority/weight/pushfactor/tie/interpolation, hit admission, and scores remain blocked.
