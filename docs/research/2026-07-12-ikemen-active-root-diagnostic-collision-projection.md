# IKEMEN Active-root Diagnostic Collision Projection Research

Date: 2026-07-12
Wayfinder: 102
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

How can debug tooling show P3-P8 Clsn geometry without granting push, incoming/outgoing hits, targets, effects, or pair HUD/audio ownership?

## Answer

Evolve `RuntimeRootPresentation` to v1 with a third independent consumer: `collisionRootIds`. Every root row gains `collisionDebug` plus a stable reason. Renderer resolution validates ids across `actors` and `reserveActors`, then passes selected roots plus existing effect actors into `CollisionBoxRenderer`. Character draw, camera, hit sparks, combat, effects, HUD, and audio retain current owners.

Explicit Tag eligibility: registered, valid-side, player-type, non-disabled, non-standby roots. `AssertSpecial invisible` and `ScreenBound moveCameraX = 0` do not suppress diagnostic collision. Over-KO remains eligible. Legacy/unknown/Single preserve exact P1/P2 enrollment.

Pinned IKEMEN can classify standby Clsn2 while suppressing standby Clsn1. The sandbox cannot yet execute Tag leaving/waiting choreography or distinguish collision palettes, so v1 excludes standby roots entirely. This prevents stale P1 overlays after immediate P1-to-P3 handoff.

## Source Facts

1. Current animation frame is committed for hit detection and debug info: [frame reference](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11860-L11868).
2. Debug Clsn1 adds nothing for standby: [Clsn1 enrollment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12461-L12476).
3. Debug Clsn2 has a standby class independent from hit admission: [Clsn2 classification](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12478-L12539).
4. Size geometry appears only while PlayerPush is enabled: [size box](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12611-L12618).
5. Actual collision/hit admission separately rejects standby/disabled actors: [collision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10284-L10315), [hits](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13208-L13228).

## Local Ownership

| Surface | Current | v1 decision |
| --- | --- | --- |
| `RuntimeFrameWorld` | Pair/reserve snapshots clone current Clsn1/Clsn2. | Reuse immutable data. |
| `RuntimeRootPresentation/v0` | Independent draw/camera rows. | Add collision row/id; bump v1. |
| Character renderer | Resolves draw ids. | Unchanged. |
| Collision renderer | Hard-coded pair roots plus effects. | Resolve collision ids; effects unchanged. |
| `CollisionBoxRenderer` | Stateless clear/rebuild. | Keep policy-free. |
| `AxisRenderer` | Stage/grid axis, not per-root axes. | Unchanged; actor axes deferred. |
| DebugPanel/Studio | Stable pair slots plus selectable snapshots. | No indexing change. |
| Combat/targets | Pair post-fighter. | No change; collision ids diagnostic only. |

## Wayfinder 103 Contract

- Upgrade `RuntimeRootPresentation/v1`; add collision boolean/reason and ordered ids.
- Legacy/unknown/Single exact pair behavior; Tag active roots independent from invisible/camera flags.
- Strict reusable actor resolver rejects duplicate snapshot actors, duplicate ids, unknown ids.
- Route selected roots only to collision renderer; existing effect overlays stay intact.
- Extend trace sidecar/gate with exact collision ids and no effect/combat widening.
- Browser proves `[p1,p2] -> [p3,p2] -> [p1,p2]`, collision actor IDs, visible overlays, stale cleanup at desktop/mobile.
- Cover disabled/nonplayer/invalid/standby, invisible, camera exclusion, over-KO, empty side, malformed ids, detached snapshots, reset.

## Adversarial Audit

- Reusing draw ids fails invisible debug inspection.
- Appending every reserve falsely displays standby and stale roots.
- Mutating `snapshot.actors` breaks HUD/audio/index contracts.
- Using diagnostic ids in combat turns observability into gameplay authority.
- Size boxes require explicit geometry and PlayerPush policy; defer.

## Deletion Criteria

Remove standby exclusion when Tag choreography executes and renderer supports distinct standby Clsn2 versus suppressed Clsn1. Extend v1 when size boxes, actor axes, rotation, localcoord, and exact colors land.

## Claim Ceiling

Allowed: implementation-ready P3-P8 Clsn1/Clsn2 diagnostic selection and renderer handoff.

Blocked: standby Clsn2 parity, size geometry, actor axes, push, hit mutation, exact colors/text/rotation/localcoord, scores, or full collision parity.

## Implementation Outcome

Wayfinder 103 implemented the selected boundary. `RuntimeRootPresentation/v1` publishes exact collision ids independently from draw/camera; Three.js strictly resolves pair/reserve actors and feeds selected roots plus unchanged effect actors into `CollisionBoxRenderer`. The existing required presentation trace remains checksum-stable inside 543/543 artifacts while exact collision ids are now gated. Desktop/mobile smoke proves `[p1,p2] -> [p3,p2] -> [p1,p2]`, two collision boxes, 1006/1163-color nonblank canvases, and stale cleanup. Full gates pass 176 files / 1798 tests, TypeScript 7, production build, boundaries, visual inspection, and diff audit. Push, hit admission, targets, and scores remain unchanged.
