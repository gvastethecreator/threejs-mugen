# Research: Turns Terminal Outcome and Score Ownership

## Question

Which official IKEMEN rules must govern the match score when automatic Turns
continuation promotes a reserve or reaches a side defeat?

## Official findings

- IKEMEN's start flow sets each side's Turns target to the enemy team's selected
  character count. This means the score threshold is roster-owned, not the
  generic single/tag round default. See the official
  [`start.lua`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/external/script/start.lua?plain=1#L341-L356).
- `matchOver()` compares each side's positive `wins` counter with its own
  `matchWins` target. See official
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L1485-L1489).
- During post-round processing, the winner counter is derived from the other
  side's effective loss, and Turns is explicitly included in that update path.
  See official
  [`system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L3123-L3137).
- The official round loop only prepares another ordinary round when the match
  is not over and no Turns effective loss requires a member transition. When
  the match is still alive, Turns promotion restarts the fight; otherwise the
  engine enters its terminal post-match path. See official
  [`runNextRound`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1#L4055-L4115).

## Decision

`PlayableMatchRuntime` now derives side-specific Turns targets from the live
root roster. The score owner is the side that eliminated the opposing active
member. A successful replacement records one score event only after the typed
handoff, resource reset, and state-5900 preflight have committed. A side defeat
records the terminal event, publishes `matchOver`, and stops the playable loop.

The generic outcome contract remains compatible for single, simul, and tag
round scoring. Asymmetric Turns targets are represented by optional
`matchWinsBySide`; the existing scalar `matchWins` remains the compatibility
summary for the HUD and older trace consumers.

## Evidence

- `RuntimeMatchOutcomeSystem.test.ts` proves side-specific thresholds and
  winner-owned score increments.
- `PlayableMatchRuntime.test.ts` proves the production automatic route exposes
  `wins: {1: 1, 2: 0}` after replacement and closes the no-reserve path with
  side 1 as terminal winner.
- Focal Playable/outcome suite: 206 tests passed.
- TypeScript 7 typecheck and `git diff --check`: passed.
- Full suite: 209 test files / 2112 tests passed with `--maxWorkers=4`.
- Build, boundaries, and CSS budget passed; the build still reports the
  existing large JavaScript chunk warning.
- Trace corpus: 600/600 artifacts passed (566 required / 34 optional).
- Playwright core smoke passed in
  `.scratch/qa/qa-smoke-turns-terminal-outcome-score-core-rerun/`; the final
  diagnostics contain zero console issues and zero page errors. The optional
  Code Fu Man browser fixture was absent and therefore explicitly skipped.

## Claim ceiling

The port now has a bounded source-backed Turns roster score and terminal
contract. Exact Lua-driven draw limits/effective-loss variants, winpose and
motif ownership, preloaded loading, rollback/netplay, and full parity remain
open; the next nearby runtime slice should resolve the draw/effective-loss
boundary before increasing broader Turns claims.
