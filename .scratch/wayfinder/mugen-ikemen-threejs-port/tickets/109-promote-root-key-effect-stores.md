# Promote Root-key Effect Stores

Type: implementation
Status: resolved
Blocked by: None

## Goal

Replace fixed P1/P2 effect stores with deterministic actor-keyed root stores so reserve-root hit mutation cannot alias effects into another player.

## Acceptance

- Introduce actor-keyed effect-store registry while preserving P1/P2 public behavior and summaries.
- Register every authoritative root at match construction; reject unknown owners instead of aliasing.
- Route spawn/query/remove/reset/snapshot/trace operations by exact root id.
- Preserve Helper root/parent identity and deterministic serial/run-order behavior.
- Cover P3/P4 isolation, unknown owner, reset, target get-hit cleanup, projectile/helper/explod ownership, and pair regression.
- Update participation/capabilities only when real effect-store ownership exists.
- Pass focused/full tests, TypeScript 7, build, trace, boundaries, docs, audit, and commit.

## Claim Ceiling

Allowed: exact actor-keyed effect ownership for runtime roots.

Blocked: active-root direct-hit mutation, plural effect advancement/presentation, helper/projectile combat widening, round/HUD/audio, scores, or full parity.

## Outcome

`RuntimeEffectActorWorld` now registers and resolves exact root ids, preserves the P1/P2 compatibility keys, rejects unknown owners, and resets every unique registered store. Match construction registers all authoritative roots before runtime use. Helper get-hit cleanup explicitly routes through its root owner. Focused root-isolation, unknown-owner, reset, registry, helper, and trace tests cover the boundary without widening effect execution.
