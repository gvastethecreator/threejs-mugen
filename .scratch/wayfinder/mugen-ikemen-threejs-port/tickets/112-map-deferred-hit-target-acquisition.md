# Map Deferred Hit Target Acquisition

Type: research
Status: ready
Blocked by: None

## Goal

Specify upstream-style per-actor HitDef target buffering and deterministic post-update commit before active-root direct hit mutation.

## Acceptance

- Pin buffer insertion, duplicate handling, target id ownership, and commit/clear order to IKEMEN source.
- Inventory direct, projectile, Helper, ReversalDef, and TargetDrop acquisition routes locally.
- Select exact actor-local pending storage and one commit phase without changing pair checksums.
- Define pause/hitpause/reset/state-change behavior and actor-scoped trace evidence.
- Keep P3-P8 direct mutation blocked until commit semantics are verified.

## Claim Ceiling

Allowed: implementation-ready deferred HitDef target acquisition contract.

Blocked: active-root hit mutation, projectile/helper target parity, throws, round/HUD/audio, scores, or full parity.
