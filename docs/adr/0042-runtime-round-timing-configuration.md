# ADR 0042: Runtime Round Timing Configuration

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

T275 made win-pose readiness explicit, but both the round clock and the
`PlayableMatchRuntime` handoff still depended on module constants. That would
allow a future fightscreen parser or fixture to change one boundary while the
other continued using a stale value. Pinned IKEMEN-GO defaults provide a clear
source-backed baseline, but parsed source ownership is not implemented yet.

## Decision

- Add a resolved `RuntimeRoundTiming` contract with phase-4 opening,
  win-pose readiness, post-KO duration, slowdown duration, fade duration, and
  slowdown rate.
- Keep the pinned local defaults at `45` phase-4 opening frames, `45` win-pose
  frames, `255` post-KO frames, `60` slowdown frames, `45` fade frames, and
  `0.25` slowdown rate.
- Accept partial overrides through `PlayableMatchRuntimeOptions.roundTiming`
  and normalize non-finite, negative, out-of-order, and out-of-range values
  deterministically. The resolved object is shared by `RuntimeRoundSystem` and
  the `RuntimeRoundWinPose/v0` caller.
- Preserve legacy default constants as aliases and preserve the default
  snapshot/trace contract. Do not add parsed fightscreen ownership here.

## Consequences

Timing fixtures can now exercise alternate phase-4 and readiness boundaries
without editing runtime constants, while normal runs remain checksum-stable.
The contract is ready for a parsed source adapter, but does not imply that the
current default values are exact for every MUGEN/IKEMEN configuration.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundSystem.ts` and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Tests: `src/tests/RuntimeRoundSystem.test.ts` and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `14460d38`.
- Focused verification: `4` timing/readiness assertions passed,
  `pnpm typecheck` passed, and `git diff --check` passed.
- Wide checkpoint: `233` test files / `2458` tests, build, typecheck, both
  boundary checks, and `633/633` trace artifacts passed without golden
  refresh.
- Sources: [pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683), [pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268), [pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174).
