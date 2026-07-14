# Research: Turns draw and effective loss

## Question

What official IKEMEN rule separates a normal simultaneous KO from a Turns
member transition caused by draw limits?

## Official findings

- `System.maxDrawsReached` is side-scoped and only activates for non-negative
  limits when the current draw counter has already reached the limit. See
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1755-L1763).
- The official script API can mutate that limit per team through
  `setMatchMaxDrawGames(teamSide, count)`. See
  [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6582-L6591).
- At round-end, a draw sets each side's effective loss from the reached draw
  limit; a normal winner sets effective loss to the opposite side. The post-
  round counter update then increments the side that benefits from the
  opposing effective loss, including Turns. See
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L3123-L3137)
  and
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L3378-L3391).
- `runNextRound` starts an ordinary round when the match is open and neither
  Turns side has effective loss. It enters the Turns promotion/terminal branch
  only when effective loss is present. See official
  [`runNextRound`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L4055-L4115).

## Decision

The local runtime now evaluates simultaneous Turns KO as a normal draw first.
With no reached limit it records no score and restarts the ordinary next round.
When the official per-side threshold is active, only the effective-loss side
requests a reserve; a single effective loss awards the opposing side, while a
double effective loss increments both sides and can close the match as a draw.

The threshold is evaluated before the current draw is incremented, matching
the official ordering: a limit of `1` permits the first draw and applies
effective loss to the next draw.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` covers neutral draws, single-side
  effective-loss scoring, and double effective-loss score publication.
- `RuntimeTeamRoundDecisionSystem.test.ts` covers ordinary DKO and limiting
  replacement to the effective-loss side.
- `PlayableMatchRuntime.test.ts` covers automatic ordinary DKO restart and
  terminal double effective-loss draw.
- Focal slice: 230 tests passed after the bilateral handoff regression was
  qualified with explicit effective-loss input; TypeScript 7 typecheck passed.
- Broad evidence: 209 test files / 2118 tests, 289-module production build,
  boundaries, CSS budget, and 600/600 trace artifacts passed. Browser smoke
  passed across Runtime, Tag, and Studio with 64 screenshots, zero console
  issues, and zero page errors. The optional Code Fu Man fixture was absent and
  skipped.

## Claim ceiling

The implementation is a bounded in-memory compatibility slice. Exact Lua
round-end choreography, motif/winpose ownership, mixed team-mode policies,
rollback/netplay, and full MUGEN/IKEMEN parity remain open.
