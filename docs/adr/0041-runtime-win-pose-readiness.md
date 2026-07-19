# ADR 0041: Runtime Win-Pose Readiness Delay

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

T274 opened the local post-KO phase `4` window at frame `45` so an imported
win-pose state could keep the round alive with `AssertSpecial RoundNotOver`.
The handoff still requested reserved states immediately when phase `4` first
appeared. Pinned IKEMEN-GO keeps a separate `over.wintime` countdown after the
phase-4 boundary before it enters the reserved win, lose, or draw states.

## Decision

- `RuntimeRoundWinPoseSystem` exposes the bounded local default
  `DEFAULT_RUNTIME_WIN_POSE_FRAMES = 45`.
- `PlayableMatchRuntime` requests `180`, `170`, or `175` only at or after
  post-KO frame `90`: the existing phase-4 opening boundary `45` plus the
  bounded `45`-frame win-pose readiness delay.
- State availability, ambiguous-state diagnostics, `RoundNotOver` hold,
  outcome projection, score commit, and Turns ownership remain separate from
  readiness. Turns does not use this handoff.
- The adaptation is source-backed by the pinned default values only. It does
  not claim exact frame-start order, skip-input behavior, `over.forcewintime`,
  Common1/ZSS execution, motif/fade choreography, or full parity.

## Consequences

The playable runtime now preserves a bounded phase-4 interval before entering
available reserved states. A missing reserved action remains unavailable rather
than being made available by the timer, and a live `RoundNotOver` assertion
continues to hold the post-KO clock after the handoff. The delay is explicit in
the runtime contract and can be replaced when parsed round-system timing is
implemented.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundWinPoseSystem.ts` and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Test: `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `dbb13813`.
- Focused verification: `2` targeted tests passed, `pnpm typecheck` passed, and
  `git diff --check` passed.
- Wide checkpoint: `pnpm test` passed `233` files / `2456` tests; build,
  `pnpm typecheck`, both boundary checks, and `pnpm qa:trace` passed. Trace
  coverage remained `633/633` (`599` required, `34` optional). Golden refresh:
  `61c10442` (`1f3d95f3` aggregate, `3013c0b8` legal no-KO-slow artifact).
- Sources: [pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268), [pinned IKEMEN-GO default round values](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174).
