# Map Active-root Diagnostic Collision Projection

Type: research
Status: resolved
Blocked by: None

## Question

How can Three.js/debug tooling show Clsn1, Clsn2, axis, and optional size geometry for presented P3-P8 roots without changing push, incoming/outgoing hit admission, effects, targets, or pair HUD/audio ownership?

## Acceptance

- Pin IKEMEN debug Clsn enrollment, standby coloring/suppression, size-box, and frame-reference behavior at the current pinned revision.
- Map `RuntimeFrameWorld`, pair/reserve snapshot storage, `ThreeMugenRenderer`, `CollisionBoxRenderer`, DebugPanel/Studio selection, root presentation, and reset/stale geometry.
- Define explicit diagnostic ids/reasons independent from draw, camera, constraints, push, and combat capabilities.
- Select one implementation ticket with desktop/mobile or deterministic renderer proof, malformed-id failure, reset behavior, and deletion criteria.
- Update roadmap/report surfaces without runtime or score movement.

## Claim Ceiling

Allowed: one implementation-ready diagnostic collision projection.

Blocked: body push, hit admission/mutation, projectile/helper interaction, targets, effects, exact IKEMEN debug colors/text/rotation/localcoord parity, scores, or full collision parity.

## Result

Select `RuntimeRootPresentation/v1` collision eligibility/reasons and ordered ids. Tag collision debug admits valid non-standby roots independently from invisible/camera flags; renderer resolves pair/reserve roots strictly while effects and gameplay owners stay unchanged. Wayfinder 103 executes. See `docs/research/2026-07-12-ikemen-active-root-diagnostic-collision-projection.md`.
