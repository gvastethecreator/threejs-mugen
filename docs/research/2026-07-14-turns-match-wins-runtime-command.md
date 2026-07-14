# Research: Turns match-wins runtime command

## Question

What source-backed browser seam represents IKEMEN's live
`setMatchWins(teamSide, wins)` mutation while preserving the local outcome
owner and the current Lua claim ceiling?

## Official findings

- IKEMEN documents `setMatchWins(teamSide, wins)` as a per-team mutation,
  validates side `1` or `2`, and writes the side target. See
  [`script.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/script.go?plain=1#L6595-L6608).
- The match is over when either side has a positive score at or above its
  configured target. See
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1485-L1489).
- The browser scanner reports Lua/ZSS hooks but does not execute them; a typed
  command is therefore a lower-level host/runtime adapter, not a Lua port.

## Decision

Add a profile-gated `set-match-wins` command alongside the draw-limit command.
It updates one side only, applies the existing bounded target policy, publishes
side-specific targets when they differ, and immediately closes the match if a
positive existing score already satisfies the new target.

This keeps match policy in `RuntimeMatchOutcomeSystem`; it does not widen
round, team, renderer, Studio, or script ownership.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` proves live target lowering closes the
  match and blocks later scoring.
- `MatchWorld.test.ts` proves command forwarding and non-IKEMEN rejection.
- Focal verification: 2 test files / 24 tests passed; TypeScript 7 typecheck
  and `git diff --check` passed.

## Open boundary

Batch verification remains: full tests, trace corpus, build, boundaries, CSS
budget, and browser smoke. Lua/ZSS execution, zero-win training behavior,
rollback/netplay, and full match-flow parity remain open.
