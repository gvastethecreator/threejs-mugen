# Research: Runtime win-pose handoff

Date: 2026-07-18  
Ticket: [T273](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/273-runtime-win-pose-handoff.md)

## Question

What source-backed boundary should own the first local state-180 handoff after
the phase-4 round close, while keeping timing, Common1, and motif behavior
honest?

## Primary sources

- [Elecbyte MUGEN 1.1 MatchOver trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  states that `MatchOver` does not become true until players start win poses in
  state `180`.
- [Elecbyte AIR reserved action reference](https://www.elecbyte.com/mugendocs-11b1/air.html)
  reserves optional actions `170` for lose, `175` for time-over draw, and `180`
  for win.
- [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines `AssertSpecial roundnotover` as the flag used while a character is
  performing its win pose.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3330)
  enters the over phase, updates win counters at `over.hittime`, and calls
  `selfState(180)`, `selfState(170)`, or `selfState(175)` once the win-pose
  timer reaches its handoff boundary.
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
  separates phase `3` from phase `4`; its `matchOver()` predicate remains a
  match-score predicate rather than a state-entry mutation.

## Local findings

- `RuntimeRoundSystem` already owns the bounded post-KO clock and publishes
  phase `4`, but no system owned the reserved win/lose/draw state request.
- `RuntimeStateEntryWorld` already provides the correct local availability and
  state mutation boundary: a state or animation must exist before entry.
- The round stores a display label rather than an actor identity. Duplicate
  labels therefore cannot safely identify a winner; the new system fails closed
  with `ambiguous-winner-label` instead of selecting both or guessing one.
- T272's projected score and `MatchOver` read model must remain independent of
  state-entry availability. A missing win-pose asset cannot retroactively
  commit the score.

## Decision

Add `RuntimeRoundWinPose/v0` as an idempotent phase-4 handoff world. It maps the
winner/loser/draw roles to `180/170/175`, invokes the existing state-entry path
only for the active normal/tag pair when availability is proven, and publishes
stable actor/round evidence for both started and unavailable outcomes. Turns,
time-over phase-4 behavior, Common1 controller execution, exact timing, and
motif choreography remain separate slices.

## Verification

- Focused runtime/playable coverage: `2` files / `266` tests passed.
- `pnpm typecheck` and `git diff --check` passed after the final mode guard.
- Full checkpoint: `233` files / `2453` tests, build, boundaries, redirect
  boundary, and `633/633` trace artifacts (`599` required, `34` optional).
- No additional trace golden changed.

## Next action

Use this state-entry evidence as the input to a later Common1/`RoundNotOver`
and exact timing slice. Do not expand `RuntimeRoundWinPose/v0` into score,
motif, or Turns ownership.
