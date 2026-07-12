# Map Active-root Target Lifecycle

Type: research
Status: ready
Blocked by: None

## Goal

Map actor-keyed target aging, binding, buffered acquisition, and deferred commit for explicit Tag roots before active-root direct-hit mutation is admitted.

## Acceptance

- Pin IKEMEN target buffering and commit order to an upstream revision.
- Inventory every local target owner, aging pass, TargetBind/BindToTarget consumer, reset route, and post-fighter commit point.
- Separate actor-local storage from pair-only scheduling and presentation consumers.
- Select the smallest deterministic P3-P8 lifecycle cut with pause/hitpause/reset and trace evidence.
- Preserve Pair/Single behavior and keep combat mutation blocked until target ownership is exact.

## Claim Ceiling

Allowed: source-backed target-lifecycle implementation contract.

Blocked: active-root hit mutation, target parity, throws, helpers/projectiles, round/HUD/audio, scores, or full parity.
