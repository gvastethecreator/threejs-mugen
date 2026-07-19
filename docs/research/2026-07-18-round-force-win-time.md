# Research: Round force-win timeout

Date: 2026-07-18
Ticket: [T281](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/281-round-force-win-time.md)

## Question

What does the source-backed `over.forcewintime` timer own, and what bounded
phase-4 behavior can the local Three.js runtime implement without claiming
full release or winpose parity?

## Primary sources

- [Pinned IKEMEN-GO `roundState` and `outroState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1743): round state 4 begins after `over.waittime`; the outro state separates the post-hit, pre-winpose, winpose, and terminal phases.
- [Pinned IKEMEN-GO round reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2335-L2338): `winwaittime` starts at `over.waittime + over.forcewintime` and `winposetime` starts at `over.wintime`.
- [Pinned IKEMEN-GO post-round state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268): before win poses the engine checks actor readiness at the phase-4 boundary, freezes the intro counter when an active actor is not ready, and later forces reserved win/lose/draw states after the win-pose timer expires.
- [Pinned IKEMEN-GO fight-screen defaults and parser](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174) and [parser lines](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3290-L3310): the default safety timeout is `900`, and the `[Round]` value is clamped to at least one frame.
- [IKEMEN-GO official lifebar documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features#unhardcoded-win-pose-safety-timeout-nightly-build-only): documents the hidden MUGEN 900-frame safety timer and the configurable IKEMEN `over.forcewintime` replacement.

## Local findings

- `MugenSystemAssetsLoader` already parses and preserves `overForceWinTime` in
  `MugenFightScreenTiming`; T277 intentionally left it metadata-only.
- `RuntimeRoundSystem` owns the local post-round clock and phase transition,
  while `RuntimeMatchRoundWorld` owns timer-freeze and `RoundNotOver` policy.
- `PlayableMatchRuntime` has active root runtime metadata sufficient for a
  bounded readiness proxy: life/team availability, `ctrl`, `stateType`,
  `moveType`, and `animNo`.
- The local public `RuntimePostRound/v0` snapshot does not need a new field for
  this slice. The held phase and stable post-round frame are observable without
  changing trace/snapshot schema.

## Decision

Map `over.forcewintime` into a `forceWinTimeFrames` timing field. When that
field is present and an active root is still controllable standing idle outside
animation 5, keep phase 3 at the configured wait boundary. Freeze the local
post-round frame and remaining clock while readiness is unresolved, then
release early when roots become ready or force release when the bounded window
expires. For time-over, skip the animation-5 portion of the readiness proxy as
the upstream source comment describes. Keep the default local value zero when
no source/override value exists so demo/default snapshots remain stable.

This is a deliberately bounded adapter, not a replacement for IKEMEN's full
`intro`, `winwaittime`, active-player, Common1, motif, fade, or team lifecycle.

## Uncertainty

The local runtime does not yet model the complete upstream `activelyFighting`,
`SCF_over_alive`, `SCF_over_ko`, state-owner, Common1/ZSS, or fade/dialogue
state machines. Exact frame-start ordering and behavior when the terminal
`over.time` boundary competes with an unresolved safety timeout remain open.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`: `3` files / `295` tests passed.
- `pnpm typecheck`: passed with TypeScript `7.0.2`.
- `git diff --check`: passed before the implementation commit.
