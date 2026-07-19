# ADR 0045: Bounded Round No-damage Window

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The loader already retained `fight.def` `over.hittime`, but the local round
timing contract did not. During the post-round close, the interaction loop
could still admit a newly active HitDef or other combat route, and using the
existing pause-defense predicate would conflate two unrelated contracts.

## Decision

- Add `overHitTimeFrames` to `RuntimeRoundTiming`, defaulting to the pinned
  IKEMEN value `10`, with imported `fight.def` precedence when no explicit
  runtime override is supplied.
- Expose an internal `RuntimeRoundSystem.roundNoDamage` predicate for KO and
  time-over closes after the cutoff and through the wait boundary. Preserve an
  inverted source interval as empty rather than clamping its endpoints.
- Thread that predicate through the post-fighter interaction boundary.
- Skip reversal, priority, direct HitDef, HitDef target commit, projectile, and
  helper combat admission while preserving target/effect maintenance, body
  push, bindings, guard-distance latches, clamping, and presentation.
- Keep the public `RuntimePostRound/v0` snapshot shape unchanged; this is an
  internal control read model, not a new trace contract.

## Consequences

Imported and default rounds now reject late direct combat during the bounded
source-mapped interval without stopping visual/runtime maintenance. The local
phase clock remains independently owned, so exact IKEMEN frame-start and
phase-label parity is still open. Resource-controller suppression, score and
release choreography, and full team/Turns behavior remain separate work.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundSystem.ts`,
  `src/mugen/runtime/MatchInteractionSystem.ts`,
  `src/mugen/runtime/RuntimeMatchPostFighterSystem.ts`, and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Regression coverage: `src/tests/RuntimeRoundSystem.test.ts`,
  `src/tests/MatchInteractionSystem.test.ts`, and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commits: `daf0996b`, `25137c29`.
- Sources: [pinned IKEMEN-GO `roundNoDamage`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1652-L1659), [pinned resource guard](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8569-L8575).
