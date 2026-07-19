# Ticket 273: RuntimeRoundWinPose/v0

- Status: resolved
- Date: 2026-07-18
- Scope: own the bounded phase-4 handoff to reserved win, lose, and draw
  states for the active normal/tag pair
- Depends on: [T271](271-runtime-round-phase.md),
  [T272](272-matchover-phase4-projection.md)
- Research: [`docs/research/2026-07-18-runtime-win-pose-handoff.md`](../../../../docs/research/2026-07-18-runtime-win-pose-handoff.md)

## Question

How can the runtime make the state-180 MatchOver boundary observable through
the existing state-entry path without inventing Common1 execution, moving score
ownership, or applying an ambiguous winner label to multiple actors?

## Bounded contract

1. Add `RuntimeRoundWinPose/v0` with official reserved state mapping: `180`
   for the winner, `170` for the loser, and `175` for a draw.
2. Apply the handoff once when the bounded active normal/tag pair reaches phase
   `4`; reserve actors and Turns remain outside this slice.
3. Enter a requested state only when the existing availability boundary finds a
   state or animation. Missing state/animation is reported as `unavailable`
   without changing actor state; duplicate winner labels fail closed.
4. Publish actor `runtime.winPose` and round `winPose` snapshots with requested,
   applied, role, status, and stable diagnostics.
5. Keep `RuntimeMatchOutcomeProjection/v0`, committed score mutation, exact
   state-180 timing, Common1 controllers, and motif ownership as separate
   contracts.

## Acceptance evidence

- `RuntimeRoundWinPoseWorld` tests cover winner/loser mapping, draw mapping,
  unavailable states, ambiguous labels, phase gating, idempotence, and reset.
- Playable runtime coverage proves available `180`/`170` entries reach actor and
  round snapshots at phase `4`.
- Implementation commit: `4d9d6f76`; Turns boundary fix: `2bb4a476`.
- Focused verification passes `2` files / `266` tests, `pnpm typecheck`, and
  `git diff --check` after the final boundary fix.
- Checkpoint passes `233` files / `2453` tests, production build, TypeScript 7,
  boundaries, redirect boundary, and `633/633` runtime traces (`599` required,
  `34` optional); no additional trace golden drift was introduced.
- Browser smoke: N/A; this slice changes runtime state/read models only.

## Claim ceiling

Allowed: bounded phase-4 state `180`/`170`/`175` handoff for the active local
normal/tag pair when the requested state or animation is available. Blocked:
exact state-180 timing, `RoundNotOver` persistence, Common1/ZSS controller
execution, time-over finalization, motif/dialogue/fade choreography, Turns or
effective-loss semantics, Simul, rollback/netplay, and full MUGEN/IKEMEN parity.
