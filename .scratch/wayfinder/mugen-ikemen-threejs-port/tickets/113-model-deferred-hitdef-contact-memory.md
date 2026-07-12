# Model Deferred HitDef Contact Memory

Type: implementation
Status: ready
Blocked by: None

## Goal

Add actor-local committed and pending direct-HitDef getter ids with deterministic post-fighter commit, preserving immediate CNS target memory and current pair behavior.

## Acceptance

- Introduce bounded actor-local `hitDefTargets` and `pendingHitDefTargets` ownership with detached diagnostics.
- Reset both lists when a new direct HitDef/move starts; projectile routes must not mutate them.
- Buffer exact getter id on accepted direct hit/guard/reversal contact while CNS target memory remains immediate.
- Commit pending ids after direct combat for every valid explicit-Tag root; preserve insertion order and duplicate behavior required by source.
- Replace active-root scalar repeated-contact inspection with exact getter-id contact checks without enabling mutation.
- Cover pair, multi-getter, duplicate, reset, pause/hitpause, projectile exclusion, trace, and checksum regression.
- Pass focused/full tests, TypeScript 7, build, trace, boundaries, docs, audit, and commit.

## Claim Ceiling

Allowed: source-aligned direct-HitDef contact memory and exact read-only repeated-contact admission.

Blocked: P3-P8 direct hit mutation, exact hitonce/juggle/priority/reversal semantics, throws, projectile/helper parity, round/HUD/audio, scores, or full parity.
