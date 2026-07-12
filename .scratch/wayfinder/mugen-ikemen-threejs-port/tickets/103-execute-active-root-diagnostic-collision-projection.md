# Execute Active-root Diagnostic Collision Projection

Type: implementation
Status: resolved
Blocked by: None

## Goal

Show Clsn1/Clsn2 for selected active Tag P3-P8 roots through a runtime-owned diagnostic projection without granting push or combat.

## Acceptance

- Upgrade `RuntimeRootPresentation/v1` with stable collision eligibility/reasons and ordered ids.
- Preserve exact pair behavior outside explicit Tag.
- Select active valid Tag roots independently from invisible/camera flags; exclude standby/disabled/nonplayer/invalid roots.
- Strictly resolve collision ids across pair/reserve snapshots; reject duplicate/unknown state.
- Route selected roots plus existing effect collision actors into `CollisionBoxRenderer`.
- Extend trace requirement/evidence with exact collision ids and zero effect/combat widening.
- Desktop/mobile smoke proves handoff/reset, collision actor IDs, visible overlays, and stale cleanup.
- Pass full tests, TypeScript 7, build, trace, smoke, boundaries, visual/diff audit, docs, and commit.

## Claim Ceiling

Allowed: diagnostic P3-P8 Clsn1/Clsn2 rendering.

Blocked: standby Clsn2, size boxes, actor axes, push, hit mutation, exact debug palette/text/rotation/localcoord, scores, or full collision parity.
