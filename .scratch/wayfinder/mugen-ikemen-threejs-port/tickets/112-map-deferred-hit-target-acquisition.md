# Map Deferred Hit Target Acquisition

Type: research
Status: resolved
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

## Outcome

Upstream disproves deferred CNS target acquisition: successful direct contact immediately calls `addTarget(getter.id)`, which deduplicates the live target list. The deferred structure is `hitdefTargetsBuffer`, a separate per-HitDef getter-contact list used by hitonce, juggle, priority, and reversal admission. It appends on direct contact, commits after character update, and clears with the next non-projectile HitDef reset. Wayfinder 113 models this contact memory without changing current CNS target timing.
