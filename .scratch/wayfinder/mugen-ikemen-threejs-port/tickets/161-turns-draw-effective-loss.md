# Ticket 161: Turns draw and effective-loss boundary

Status: closed
Entry: 522

## Question

How should an IKEMEN Turns match handle a simultaneous KO when the draw limit
has not been reached, and when a side has reached its configured maximum draw
count?

## Source-backed decision

- IKEMEN stores a maximum draw count per team and treats a limit as reached when
  `limit >= 0 && draws >= limit` in [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1755-L1763).
- The official Lua bridge exposes the per-side `setMatchMaxDrawGames` mutation
  in [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6582-L6591).
- A draw derives `effectiveLoss` from the reached limits; post-round scoring
  awards the opposing side and includes Turns in that path in
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L3123-L3137),
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L3378-L3391).
- The round loop only promotes a Turns member for effective loss; otherwise it
  starts an ordinary next round in
  [`runNextRound`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L4055-L4115).

## Implementation

- `RuntimeMatchOutcomeSystem` now accepts optional per-side draw limits,
  exposes effective-loss facts, keeps the official pre-increment threshold,
  awards the opposing side for a single effective loss, and represents a
  terminal double effective-loss as a draw without a fabricated winner.
- Turns decision/preflight distinguishes a simultaneous KO from a member KO:
  an ordinary DKO restarts the next round; only the effective-loss side can
  request a replacement when the draw limit is active.
- `PlayableMatchRuntime` exposes `maxDraws` and `maxDrawsBySide`, wires the
  limit into the automatic Turns route, and publishes a draw terminal message
  only when the outcome is genuinely a terminal draw.

## Evidence

- Focal outcome, decision, continuation, and Playable coverage: 222 tests
  passed.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Code commit: `91f19a89`.

## Claim ceiling

This closes bounded source-backed draw/effective-loss behavior for the local
Turns runtime. Exact motif/winpose timing, all Lua mutation routes, complex
mixed-team draw policies, rollback/netplay, asset preloading, and full
MUGEN/IKEMEN parity remain open.
