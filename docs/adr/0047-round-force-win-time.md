# ADR 0047: Round Force-win Timeout

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

T277 imported the fight-screen timing values but left `over.forcewintime`
metadata-only. IKEMEN initializes a hidden win-pose safety timer from
`over.waittime + over.forcewintime`, checks whether active actors are ready to
enter the round-state-4 path, and forces the win/lose/draw handoff after the
safety window. The local runtime opened phase 4 unconditionally at the wait
boundary and therefore could not represent that bounded readiness hold.

## Decision

- Add `forceWinTimeFrames` to `RuntimeRoundTiming` and map imported
  `MugenFightScreenTiming.overForceWinTime` into it.
- Keep phase 3 at the configured wait boundary while an active root is alive,
  enabled, not standby/over-KO, controllable, standing, idle, and outside
  animation 5.
- Freeze the local post-round frame and remaining clock during that hold; exit
  early when roots become ready, or force phase 4 after the configured frame
  budget.
- Skip the animation-5 readiness check for time-over, preserving the bounded
  source exception.
- Use zero when no source or explicit override provides the force timeout, so
  existing demo/default behavior and snapshots remain stable.

## Consequences

Imported root timing can now delay the phase-4 boundary without changing the
public snapshot schema. The same `roundNoDamage` projection remains true at the
held wait boundary. The local adapter exposes useful behavior for imported
players while leaving helper/team/Common1/motif ownership explicit.

The default source value of `900` is not invented for demo fighters; it is
activated only when the loader/runtime receives a numeric source or explicit
override. Exact upstream `intro` sequencing, `winwaittime` accounting, and
release choreography remain outside this ADR.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundSystem.ts`,
  `src/mugen/runtime/RuntimeMatchRoundSystem.ts`, and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Regression coverage: `src/tests/RuntimeRoundSystem.test.ts`,
  `src/tests/RuntimeMatchRoundSystem.test.ts`, and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `1e8cdda`.
- Sources: [IKEMEN round-state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268), [round reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2335-L2338), and [official safety-timeout documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features#unhardcoded-win-pose-safety-timeout-nightly-build-only).
