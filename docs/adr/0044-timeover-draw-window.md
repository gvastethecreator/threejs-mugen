# ADR 0044: Bounded Time-over Draw Window

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The runtime could report `state = "timeover"` and `winner = "Draw"`, but
`RuntimeRoundSystem` marked that state terminal during `finishIfNeeded()`. The
match loop therefore stopped before phase `4`, and the existing
`RuntimeRoundWinPoseWorld` draw mapping to state `175` was unreachable from a
playable time-over round.

## Decision

- Initialize the shared resolved post-round duration for both `ko` and
  `timeover` finishes.
- Advance the time-over post-round frame and transition to phase `4` using the
  same `RuntimeRoundTiming.postKoPhase4StartFrames` boundary as KO.
- Keep time-over playback at normal speed and keep KO-only slowdown metadata
  out of the time-over snapshot.
- Apply the existing phase-4 `RoundNotOver` hold to both terminal states.
- Keep `RuntimeRoundWinPose/v0` as the owner of optional draw state `175`
  entry; do not add a second draw-pose implementation.
- Require public next-round callers and stage evidence journeys to wait for
  `postRound.remaining = 0` before opening the next round.

## Consequences

Timer expiry now remains playable during the bounded post-round close window,
which makes draw state `175` observable when imported roots provide it. The
default KO timeline, playback slowdown, explicit timing precedence, and Turns
win-pose exclusion remain unchanged. Tests and stage journeys now model the
real terminal boundary rather than treating the first time-over snapshot as
already closed.

The implementation still does not own fade/motif/dialogue release,
`over.hittime`, `over.forcewintime`, skip input, Common1/ZSS, or full team
continuation semantics.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundSystem.ts` and
  `src/mugen/runtime/RuntimeMatchRoundSystem.ts`.
- Consumer migration: `src/mugen/runtime/RepositoryStageJourney.ts` and the
  public/runtime journey tests.
- Draw proof: `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `a2ce3298`.
- Focused proof: `928/928` assertions, TypeScript 7 typecheck, and diff check.
- Wide proof: `233` test files / `2462` tests, production build, both
  boundaries, redirect boundary, and `633/633` trace artifacts (`599`
  required, `34` optional); default goldens remained stable.
- Sources: [pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683), [pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268).
