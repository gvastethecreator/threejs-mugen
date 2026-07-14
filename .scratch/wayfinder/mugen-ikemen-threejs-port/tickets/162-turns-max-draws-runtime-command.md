# Ticket 162: Runtime command for Turns draw limits

Status: closed
Entry: 523

## Question

How can the browser runtime represent the official IKEMEN per-side
`setMatchMaxDrawGames(teamSide, count)` mutation without claiming Lua
execution?

## Source-backed decision

- IKEMEN exposes a Lua function that validates team side `1` or `2` and writes
  the count into the side-scoped `maxDraws` array in
  [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6582-L6591).
- Draw eligibility reads the side limit using
  `limit >= 0 && draws >= limit` in
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1755-L1763).
- The browser port remains scanner-only for Lua, so this slice exposes a typed
  host/runtime command instead of pretending to execute Lua hooks.

## Implementation

- `RuntimeMatchOutcomeSystem.setMaxDraws` mutates one bounded side limit and
  preserves the existing omitted representation when both sides are unlimited.
- `PlayableMatchRuntime` accepts `set-match-max-draws` only under the explicit
  `ikemen-go` profile and routes the mutation into the live outcome system.
- `MatchWorldOptions` now forwards scalar and side-specific draw limits to the
  playable runtime.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` and `MatchWorld.test.ts`: 23 tests passed.
- Broad suite: 209 test files / 2122 tests, 289-module build, boundaries, CSS
  budget, and 600/600 trace artifacts passed.
- Browser command probe passed with zero console/page errors at
  `.scratch/qa/qa-smoke-turns-rules-command-browser/diagnostics.json`.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Code commit: `646fa705 feat: expose IKEMEN match draw limit mutation`.

## Claim ceiling

This is a bounded typed runtime adapter for the official setter. It does not
execute Lua/ZSS, expose arbitrary script registration, or claim exact
unbounded/rollback/netplay behavior or full MUGEN/IKEMEN parity.
