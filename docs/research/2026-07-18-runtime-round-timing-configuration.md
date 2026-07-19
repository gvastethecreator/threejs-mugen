# Research: Runtime round timing configuration

Date: 2026-07-18  
Ticket: [T276](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/276-runtime-round-timing-configuration.md)

## Question

Which timing values should become an explicit runtime contract before parsed
fightscreen configuration is connected?

## Primary sources

- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683): phase `4` begins after `over.waittime`, while the pre-over phase remains distinct.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268): the win-pose countdown starts after the phase-4 boundary and drives reserved `180`/`170`/`175` entry.
- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174): `over.waittime = 45`, `over.wintime = 45`, and `over.time = 210`; KO slowdown defaults are `60`, `45`, and `0.25`.

## Local findings

- `RuntimeRoundSystem` currently embeds phase-4 start, post-KO duration, KO
  slowdown, and fade values in module constants.
- `PlayableMatchRuntime.applyRoundWinPose()` separately recomputes readiness
  from two constants, so a future parsed timing source could drift from the
  round clock.
- Existing default snapshots and trace goldens depend on the current `45` /
  `255` / `60` / `45` / `0.25` values; the configuration cut must preserve them
  exactly when no override is supplied.

## Decision

Introduce one resolved `RuntimeRoundTiming` object at the round-system
boundary. Keep the existing constants as compatibility aliases for tests and
external imports, but make runtime behavior read from the resolved object.
Expose partial overrides only through `PlayableMatchRuntimeOptions` for now;
the parser and fightscreen source owner remain a later slice.

## Claim ceiling

This is configuration plumbing plus deterministic normalization. It does not
claim parsed source configuration, exact upstream frame-start order,
`over.forcewintime`, skip-input behavior, Common1/ZSS, release choreography,
time-over state `175`, or full parity.

## Verification

- Implementation commit: `14460d38`.
- Focused timing/readiness assertions passed; `pnpm typecheck` passed.
- Broad proof passed: `233` test files / `2458` tests, production build,
  boundaries, redirect boundary, and `633/633` trace artifacts. Default
  checksums remained stable, including `mugen-lite-journey-nokoslow` at
  `3013c0b8`.
