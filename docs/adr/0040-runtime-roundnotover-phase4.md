# ADR 0040: Runtime Phase-4 RoundNotOver Hold

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The runtime already projected phase `4` and could enter reserved win/lose
states, but it opened phase `4` only at the end of the post-KO clock. That made
the state-`180` controller path unable to keep a live round through
`AssertSpecial RoundNotOver`: the match loop had already reached its terminal
stop boundary.

Elecbyte defines `RoundNotOver` as a per-tick win-pose assertion, while pinned
IKEMEN-GO separates the pre-over and over phases before the terminal round
transition. The existing `RuntimeGlobalAssertSpecialWorld` already provides a
normalized `roundNotOver` read model.

## Decision

- `RuntimeRoundSystem` transitions from phase `3` to phase `4` at bounded
  post-KO frame `45`, without setting `isOver` until the existing `255`-frame
  post-KO window completes.
- `RuntimeMatchRoundWorld` owns the phase-4 hold check. For a KO round with
  `round.currentPhase === 4` and global `roundNotOver`, it returns
  `{ frozen: false, held: true }` and skips `round.tickTimer()`.
- When the flag disappears, normal post-KO ticking resumes. No new release
  controller or score mutation is introduced.
- `RuntimeRoundWinPose/v0` remains the state-entry owner; imported CNS remains
  the source of the per-tick `AssertSpecial` assertion.

## Consequences

State `180` can now execute its authored `RoundNotOver` controller while the
round remains playable. The public snapshot shows stable post-KO progress
during the hold, and the same timer resumes when the assertion clears. The
adapted `45`/`255` timing is explicit and observable, but it is not exact
IKEMEN/MUGEN timing. Time-over `175`, Common1/ZSS readiness, motif ownership,
Turns, Simul, rollback, and full parity remain open.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundSystem.ts` and
  `src/mugen/runtime/RuntimeMatchRoundSystem.ts`.
- Tests: `src/tests/RuntimeRoundSystem.test.ts`,
  `src/tests/RuntimeMatchRoundSystem.test.ts`, and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `db36894c`.
- Focused verification: `4` files / `287` tests and `pnpm typecheck` passed.
- Sources: [Elecbyte AssertSpecial](https://www.elecbyte.com/mugendocs-11b1/sctrls.html), [pinned IKEMEN-GO roundState](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683).
