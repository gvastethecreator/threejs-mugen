# IKEMEN Active-root Constraint And Collision Promotion Research

Date: 2026-07-12
Wayfinder: 100
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed promotion that lets an already-live, presented P3-P8 Tag root obey stage constraints or expose collision geometry without silently granting push or combat?

## Answer

Promote stage clamping first. Add an actor-local constraint phase to `RuntimeRootMotionAdvanceWorld` after kinematics and animation for already-live explicit-Tag `active-motion` roots. The phase calls existing `RuntimeActorConstraintWorld.clampToStage` and records an actor-scoped schedule row. It must not enroll the root in pair push, target binding, guard distance, direct/projectile/helper combat, effects, round, HUD, audio, or resources.

Do not promote body push or combat in the same cut. IKEMEN push is a global active-character pass with team policy, size/hurt-box overlap, priority, weight, push factor, localcoord, Y/Z tests, tie breaking, and reclamping. Local `separate` is pair-only, X-only, symmetric, and owned by P1/P2 post-fighter. Diagnostic collision rendering is separate: it can later project selected roots' frame boxes without making them hittable.

## Upstream Facts

1. `xScreenBound` applies screen bounds only to trackable non-standby characters, then applies stage bounds independently: [screen/stage bounds](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9871-L9895).
2. The committed animation frame becomes hit/debug reference; actor action applies X/Z bounds before `actionFinish`: [frame commit and bounds](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11860-L12020).
3. Generic collision rejects standby/disabled participants before fetching Clsn boxes: [collision admission](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10284-L10342).
4. Debug Clsn suppresses standby Clsn1, can classify standby Clsn2, and draws size boxes only while PlayerPush is enabled: [debug projection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12457-L12620).
5. Player hit detection independently rejects standby/disabled getters and attackers: [hit admission](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13208-L13228).
6. Push iterates RunOrder, rejects standby/disabled or PlayerPush-off actors, applies team and multidimensional geometry policy, then reclamps positions: [push detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13845).
7. Global interaction order is push, player hits, projectile hits: [interaction order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13932).
8. Tag states change ScreenBound, camera movement, position, velocity, invisibility, and standby: [Tag states](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L72-L148).

## Local Ownership Map

| Consumer | Current owner | Promotion decision |
| --- | --- | --- |
| Actor-local stage clamp | `RuntimeActorConstraintWorld.clampToStage`; P1/P2 after combat | Add active-root call after local motion. |
| Body push | `RuntimeMatchInteractionWorld.separateActors(p1,p2)` | Block; primitive cannot represent plural IKEMEN policy. |
| Frame Clsn | `RuntimeFrameWorld`; pair/reserve snapshots | Keep storage; defer rendering to diagnostic projection. |
| Collision renderer | Pair plus effects | Block in 101; diagnostic ids must not imply combat. |
| Direct/projectile/helper combat | Pair post-fighter owners | Block. |
| Targets/contact/guard distance | Pair post-fighter transaction | Block. |
| Phase capabilities | `RuntimeRootPhaseCapabilities/v1` | Add explicit `constraints`; do not overload motion/combat. |
| Tick schedule | Actor motion plus pair post-fighter rows | Add actor-scoped `fighter:constraints` after animation. |

## Wayfinder 101 Contract

- Add explicit root constraint capability; playable roots and explicit-Tag active-motion roots are true, standby/unavailable roots false.
- Extend root motion with `applyConstraints` after animation; call stage clamp only.
- Record actor-scoped `fighter:constraints`; comparator rejects actor-id mismatch.
- Required trace drives P3 beyond an edge and proves exact boundary X with combat/effect/target totals zero.
- `ScreenBound bound = 0` skips clamp; standby/disabled roots and same-pass TagIn do not enter the phase; reset restores baseline.
- Browser is N/A: deterministic trace covers this nonvisual ownership change.

## Adversarial Audit

- Reusing `combat` or `presentation` capability hides ownership and risks widening.
- Calling pair `separate` for P3/P2 falsely claims global push and mutates P2 without policy.
- Adding reserve roots to collision renderer would visually imply hit admission.
- Clamping before kinematics permits same-tick escape; clamp observes final motion.
- In-range final X alone is vacuous; trace must prove out-of-range motion plus exact clamp and absent interaction stores.

## Uncertainty And Deletion Criteria

Current stage bounds do not distinguish IKEMEN screen bounds, stage bounds, edge widths, localcoord ratios, Z depth, or interpolation. Wayfinder 101 claims only sandbox stage-X clamp semantics. Replace the bounded implementation when those dimensions gain explicit owners and parity tests; retain actor-local constraint capability and schedule evidence.

## Claim Ceiling

Allowed: one implementation-ready actor-local active-root stage-X clamp boundary.

Blocked: body push, collision-debug widening, hits/projectiles/helpers/targets/guard distance, effects, round/resources, exact ScreenBound/stagebound/localcoord/Z/interpolation parity, Tag choreography, scores, or full collision parity.

## Implementation Outcome

Wayfinder 101 implemented the selected actor-local boundary. `RuntimeRootPhaseCapabilities/v2` adds `constraints`; active-root motion records `fighter:constraints` after animation and applies the existing stage-X clamp. Required checksum `870f8871` and frames `37e1175b`, `63a42885`, `842716e7` pass inside 543/543 artifacts with final P3 `x=-154`, target count zero, empty pair effect stores, and no hit/guard evidence. Push, diagnostic collision, and combat remain blocked.
