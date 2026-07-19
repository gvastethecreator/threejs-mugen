# ADR 0038: MatchOver Phase-4 Projection

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The official MUGEN trigger contract makes `MatchOver` observable at the match
end, around the win-pose state-180 path, while this runtime owns score mutation
at `PlayableMatchRuntime.startNextRound()`. Publishing the committed match
outcome earlier would conflate a pending phase-4 read with durable score state.
Turns also has effective-loss and replacement decisions that cannot be safely
guessed by a generic preview.

## Decision

Add `RuntimeMatchOutcomeProjection/v0` as a pure read model:

- project the current normal/tag winner or draw without mutating wins, draws,
  round history, or `matchClosed`;
- expose terminal projections as `RoundSnapshot.matchProjection` only while
  phase `4` is active;
- synchronize actor `runtime.matchOver` from that terminal projection so CNS
  `MatchOver` can observe it;
- keep `RoundSnapshot.match` and `roundContext.matchOver` as committed outcome
  evidence;
- retain `recordRound()` and `startNextRound()` as the sole score-commit path;
  the projection is removed once that path commits.

Turns/effective-loss, time-over finalization, exact state-180 timing, and
rollback/netplay remain separate contracts.

## Consequences

The phase-4 win-pose window can expose a match-ending decision without making a
preview look like a committed score. Non-terminal rounds remain unprojected in
the playable snapshot, and a blocked next-round call leaves the score unchanged.
The current trace corpus remains stable because no existing trace route enters
the new terminal projection path.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeMatchOutcomeSystem.ts`,
  `src/mugen/runtime/PlayableMatchRuntime.ts`, and
  `src/mugen/runtime/types.ts`.
- Tests: `src/tests/RuntimeMatchOutcomeSystem.test.ts`,
  `src/tests/RuntimeExpressionContextSystem.test.ts`, and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `5f4e7ccb`.
- Focused verification: `3` files / `294` tests; `pnpm typecheck` passed.
- Full checkpoint: `232` files / `2448` tests; build, TypeScript 7,
  boundaries, redirect boundary, and `633/633` traces passed.
- Source reference: [Elecbyte MatchOver and RoundState trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html).

## Claim Ceiling

Allowed: bounded terminal phase-4 `MatchOver` projection for local normal/tag
rounds and projection-to-commit continuity. Blocked: exact state-180/win-pose
timing, motif/dialogue/fade timing, time-over finalization, Turns/effective
loss, Simul, rollback/netplay, and full MUGEN/IKEMEN match-end parity.
