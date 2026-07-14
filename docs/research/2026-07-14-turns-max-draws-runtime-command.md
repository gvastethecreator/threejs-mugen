# Research: Turns max-draws runtime command

## Question

What is the smallest source-backed browser boundary for IKEMEN's live
`setMatchMaxDrawGames(teamSide, count)` mutation while Lua execution remains
outside the current runtime claim?

## Official findings

- The official Lua bridge documents `setMatchMaxDrawGames(teamSide, count)` as
  a per-team mutation, validates side `1` or `2`, and stores the count in the
  corresponding system slot. See
  [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6582-L6591).
- The system reads each side independently and treats a non-negative limit as
  reached when `draws >= limit`. See
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1755-L1763).
- Lua/ZSS files are currently scanner-only in the browser port, so calling the
  local API a Lua implementation would overstate the result.

## Decision

Add a typed `set-match-max-draws` runtime command. It is profile-gated to
`ikemen-go`, updates only the requested side, clamps finite counts to the
existing bounded outcome policy, maps non-finite values to the existing
unlimited sentinel, and becomes visible in the next outcome snapshot.

The adapter is intentionally lower-level than a Lua VM: it gives host/test
code a source-backed mutation seam without inventing script execution or
side effects outside the match outcome owner.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` proves side isolation, threshold timing,
  and reset to the unlimited sentinel.
- `MatchWorld.test.ts` proves initial option forwarding, live mutation, and
  fail-closed profile gating.
- Focal verification: 2 test files / 23 tests passed; TypeScript 7 typecheck
  passed; `git diff --check` passed.
- Batched verification: 209 test files / 2122 tests, 289-module build,
  boundaries, CSS budget, and 600/600 trace artifacts passed. The focused
  browser command probe passed with zero console/page errors; the optional Code
  Fu Man fixture remains absent from the separate full visual smoke.

## Open boundary

Lua/ZSS execution, dynamic script registration, and exact unbounded count
semantics remain outside this slice.
