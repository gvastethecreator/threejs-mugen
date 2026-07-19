# Ticket 272: MatchOver phase-4 projection

- Status: resolved
- Date: 2026-07-18
- Scope: expose a non-mutating MatchOver projection when a bounded normal round
  reaches phase `4`, while keeping score commit at the existing next-round
  transaction
- Depends on: [T271](271-runtime-round-phase.md),
  [T160](160-turns-terminal-outcome-score.md)
- Research: [`docs/research/2026-07-18-matchover-phase4-projection.md`](../../../../docs/research/2026-07-18-matchover-phase4-projection.md)

## Question

How can the runtime make `MatchOver` observable during the phase-4 win-pose
window without pretending that a projected score has already been committed,
or duplicating Turns/effective-loss bookkeeping?

## Bounded contract

1. Add `RuntimeMatchOutcomeProjection/v0` as a pure read model. It projects the
   pending round result without mutating wins, draws, round history, or the
   existing `recordRound` commit path.
2. Produce the projection only at phase `4` for the current normal/tag round
   winner/draw mapping. Turns continuation and effective-loss arbitration stay
   explicitly outside this slice.
3. Keep the existing `round.match` field as committed outcome evidence and add
   optional `round.matchProjection` for the pending phase-4 read model.
4. Synchronize actor `MatchOver` from the projection at phase `4`, so CNS
   `MatchOver` can observe the declared phase policy; phase `3` and ordinary
   phase `2` keep the current value.
5. Calling `startNextRound()` commits the same result exactly once through the
   existing outcome system; a failed/blocked path must not mutate the score.

## Acceptance evidence

- Outcome-system tests prove projection arithmetic, no mutation, draw/winner
  boundaries, and match-win threshold behavior.
- Playable tests prove phase-4 actor/context projection, committed outcome only
  after the existing next-round transaction, and non-match-winning rounds stay
  unprojected.
- Expression tests prove `MatchOver` reads the projected actor runtime value.
- Focused test/typecheck plus a later full suite/trace checkpoint. Browser smoke
  is N/A unless a visible read model changes.
- Implementation commit: `5f4e7ccb`.
- Focused verification passes `3` files / `294` tests, `pnpm typecheck`, and
  `git diff --check` for the implementation surface.
- Checkpoint passes `232` files / `2448` tests, production build, TypeScript 7,
  boundaries, redirect boundary, and `633/633` runtime traces (`599` required,
  `34` optional); no additional trace golden drift was introduced.
- Browser smoke: N/A; this slice changes runtime/read-model state only.

## Claim ceiling

Allowed: bounded phase-4 MatchOver observability for normal/tag local rounds and
non-mutating projection-to-commit continuity. Blocked: exact win-pose state
180 timing, motif/dialogue/fade timing, time-over finalization, Turns/effective
loss, Simul, rollback/netplay, and full MUGEN/IKEMEN match-end parity.
