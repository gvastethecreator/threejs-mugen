# Research: Bounded time-over draw window

Date: 2026-07-18
Ticket: [T278](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/278-timeover-draw-window.md)

## Question

Why did the existing runtime expose a time-over snapshot but never reach the
draw win-pose state, and what is the smallest source-backed correction?

## Primary sources

- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683): the post-round interval remains a distinct phase before phase `4`.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268): win-pose time starts after the phase-4 boundary and the no-effective-winner branch enters reserved state `175`.
- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174): `over.waittime = 45`, `over.wintime = 45`, and `over.time = 210` remain separate source values.

## Local findings

- `RuntimeRoundSystem.finishIfNeeded()` already labeled equal-life timer
  expiry as `timeover` and `Draw`, but it set `over` immediately for that
  state. This made the round stop before phase `4` and before
  `PlayableMatchRuntime.applyRoundWinPose()` could evaluate the draw branch.
- The KO path already owns a resolved `postRound` clock, phase transition, and
  terminal callback. Reusing that authority for time-over avoids a second
  release timer and preserves default KO behavior.
- `RuntimeRoundWinPoseWorld` already maps `winner = "Draw"` to state `175` and
  fails closed when the state is unavailable. The missing piece was reachability,
  not a new draw-pose selector.
- `RuntimeMatchRoundWorld` must treat time-over like KO for the phase-4
  `RoundNotOver` hold. Without that, imported draw poses could not own the
  same bounded close window.

## Decision

Use the resolved `RuntimeRoundTiming.postKoFrames` as the bounded terminal
duration for both KO and time-over. Time-over keeps normal playback and
`noKoSlow = false`; only KO owns the slowdown budget. The next-round boundary
continues to require `round.isOver`, so public consumers and stage journeys
must drain the terminal window before starting the next numbered round.

This is deliberately a reachability and ownership correction. It does not
turn `over.hittime`, `over.forcewintime`, fade, dialogue, skip input, or
screenpack rules into runtime behavior.

## Claim ceiling

The local port now proves a bounded time-over phase-3 to phase-4 path, optional
state `175` entry, RoundNotOver hold, and terminal stop. It does not prove exact
IKEMEN frame-start order or complete release choreography.

## Verification

- Implementation: `a2ce3298`.
- Focal/runtime/world/journey tests: `928/928` assertions passed.
- TypeScript 7 typecheck: passed.
- Wide checkpoint passed: `233` test files / `2462` tests, production build,
  boundaries, redirect boundary, and `633/633` trace artifacts (`599`
  required, `34` optional). Default goldens remained stable.
