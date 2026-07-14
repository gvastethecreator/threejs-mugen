# Research: Sequential Round Context

## Question

Which round facts must remain visible to each participating root across a
multi-round imported match, and how can the runtime prove a real 1 -> 2 -> 3
sequence without resetting the round counter during the transition?

## Official Boundary

IKEMEN-GO owns the match loop and next-round reset in
[system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1).
Character runtime state and per-character fields live in
[char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).
The controller surface is defined by the official
[new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
and [changed state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29).
The official loop resets round-local state before entering available state
5900; the port therefore needs an explicit preserve-round boundary while
resetting fighter-local resources.

## Decision

- `RuntimeRoundContext/v0` owns bounded `roundNo`, `roundsExisted`, terminal
  `matchOver`, actor join-round metadata, and fail-closed transition diagnostics.
- Every root receives context at match reset; a next-round plan must advance by
  exactly one and is committed only after resource and state-5900 preflight.
- `PlayableMatchRuntime` preserves the live round counter while resetting
  fighter-local state, then commits the context and enters state 5900.
- `RoundNo`, `RoundsExisted`, and `MatchOver` are available to CNS expression
  evaluation through the root runtime snapshot. Public trace final actors expose
  post-round context without changing historical behavior checksums.
- The required imported trace performs two KO transitions and proves round 2,
  round 3, both root contexts, and the two state-5900 boundaries.

## Evidence

- `RuntimeRoundContextSystem` and `PlayableMatchRuntime` focal coverage passes
  202 tests.
- Full suite passes 207 files / 2102 tests with `--maxWorkers=4`.
- `pnpm typecheck` passes with TypeScript 7.0.2.
- `pnpm build` passes at 287 modules; the existing large-JS-chunk warning
  remains.
- `pnpm check:boundaries`, `pnpm qa:css:budget`, and desktop/mobile Runtime
  plus Studio smoke pass. Evidence is under
  `.scratch/qa/qa-smoke-round-context-sequence/`.
- `pnpm qa:trace` passes 600/600 artifacts: 566 required and 34 optional.
- Required artifact `synthetic-imported-round-context-sequence` passes with
  checksum `f2529cc2`.

## Claim Ceiling

This closes bounded sequential round context for two roots through 1 -> 2 -> 3.
It does not claim automatic Turns continuation, entrant-specific full roster
semantics, winpose/motif ownership, rollback/netplay, or complete
MUGEN/IKEMEN parity.
