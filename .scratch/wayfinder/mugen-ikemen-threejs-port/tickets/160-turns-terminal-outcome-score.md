# Ticket 160: Turns terminal outcome and score ownership

Status: closed
Entry: 521

## Question

How should the playable port close an IKEMEN Turns fight and expose score
ownership when a member is eliminated or a side has no replacement left?

## Source-backed decision

- IKEMEN configures Turns `matchWins` from the opposing team's selected member
  count in [`start.lua`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/external/script/start.lua?plain=1#L341-L356).
- `System.matchOver()` closes the match when one side's wins reach its target,
  while the post-round path increments the winning side's counter from the
  opposing side's effective loss in [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1485-L1489).
- Turns promotion happens only while the fight is not terminal; the next
  member is selected by progress and promoted from standby in
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L4055-L4115).

## Implementation

- `RuntimeMatchOutcomeSystem` accepts side-specific targets and exposes
  `matchWinsBySide` only when the thresholds differ.
- Explicit IKEMEN Turns runtime derives side 1's target from side 2's roster
  and side 2's target from side 1's roster.
- Each successful automatic replacement commits exactly one winner-owned score
  event after the handoff/reset/state-5900 transaction. A terminal side defeat
  commits the score, marks round context `matchOver`, stops playback, and
  publishes the terminal outcome in the snapshot.
- `RuntimeTurnsContinuationResult.matchOutcome` keeps the score event attached
  to the continuation evidence without changing the existing snapshot shape.

## Claim ceiling

This closes bounded in-memory Turns score ownership and terminal playback for
the implemented roster. It does not claim exact Lua `effectiveLoss`/draw-limit
configuration, winpose or motif timing, preloaded asset swaps, rollback or
netplay, or full MUGEN/IKEMEN parity.
