# Research: MatchOver phase-4 projection

Date: 2026-07-18  
Ticket: [T272](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/272-matchover-phase4-projection.md)

## Question

What is the smallest source-backed boundary that lets `MatchOver` become
observable during the end-of-round phase without conflating a pending score
with the existing next-round commit?

## Primary sources

- [Elecbyte MUGEN 1.1 MatchOver trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines MatchOver as true when the match has ended and states that the
  trigger becomes observable when players start win pose state `180`.
- [Elecbyte MUGEN 1.1 RoundState trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines phase `4` as the over/win-pose phase.
- [Pinned IKEMEN-GO `matchOver()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1475-L1479)
  checks positive wins against per-side match targets.
- [Pinned IKEMEN-GO `roundState()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
  separates phase `3` and phase `4`; [its `stepRoundState()`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3255)
  updates wins and enters win poses during the round-end path.

## Local findings

- `RuntimeMatchOutcomeSystem.recordRound()` currently mutates score and
  `matchClosed` only from `PlayableMatchRuntime.startNextRound()` or Turns
  continuation.
- `RuntimeRoundSystem` now exposes phase `4` after the bounded KO window, but
  the actor runtime still receives `matchOver` only after the commit path.
- `RuntimeRoundSnapshot.match` is currently committed evidence; reusing it for
  a pending result would make a preview look like a mutation.
- Turns uses effective-loss and replacement decisions before score commit, so a
  generic phase-4 projection would be unsound there.

## Decision

Add a pure `RuntimeMatchOutcomeProjection/v0` read model for the current
normal/tag round winner or draw at phase `4`. Store it separately as
`RoundSnapshot.matchProjection`, and derive actor `MatchOver` from it only
while phase `4` is active. Keep `recordRound()` as the sole score mutation;
after `startNextRound()` commits, the existing `round.match` and
`roundContext.matchOver` become authoritative and the projection disappears.

## Uncertainty and claim ceiling

This is a local, explicitly projected phase policy. It does not prove exact
state-180 entry, win-pose readiness, motif/dialogue/fade timing, time-over
score timing, Turns effective-loss semantics, or rollback/netplay behavior.

## Implementation result

`RuntimeMatchOutcomeProjection/v0` now provides the pure pending-result read
model. `PlayableMatchRuntime` exposes it as `round.matchProjection` only for a
terminal normal/tag phase-4 projection, synchronizes actor `MatchOver` from the
same projected result, and leaves `round.match` plus `roundContext.matchOver`
authoritative until `startNextRound()` performs the existing commit.

Implementation commit: `5f4e7ccb`.

## Verification

- Focused runtime/playable/expression coverage: `3` files / `294` tests passed.
- `pnpm typecheck` and `git diff --check` passed.
- Full checkpoint: `232` files / `2448` tests, production build, boundaries,
  redirect boundary, and `633/633` trace artifacts (`599` required,
  `34` optional) passed.
- No additional trace golden changed; the prior T271 phase metadata golden is
  already stable at `a1ce409c`.

## Next action

Keep the phase-4 projection boundary while implementing the next independent
match-end slice: exact win-pose/state-180 ownership and timing, with source
receipts and a separate commit. Do not broaden this projection into Turns,
time-over, or rollback semantics without their own outcome contracts.
