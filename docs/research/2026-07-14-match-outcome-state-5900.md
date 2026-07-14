# Research: Match Outcome and State 5900 Boundary

## Question

Which match-level facts must survive a completed round, and which official
entry point owns the transition into the next round for imported characters?

## Official Boundary

IKEMEN-GO's match loop adjudicates `matchOver` from the configured match-win
threshold and the two side win counters. Its `nextRound()` path resets the
round-local state, preserves the selected match context, and enters state 5900
for the participating characters. The primary implementation is
[IKEMEN-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1);
character-owned state and runtime fields are defined in
[IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).
The state-controller contract is documented in the official
[new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29).

## Decision

- `RuntimeMatchOutcomeSystem/v0` owns bounded `matchWins`, side wins, draws,
  completed rounds, winner side, and the terminal match-over result.
- Draws advance round history but never increment either side's score.
- `PlayableMatchRuntime.startNextRound()` records the completed round before
  applying the resource reset. A match that reaches its threshold remains in
  its terminal KO/timeover state and cannot be restarted through that route.
- `RuntimeRoundState5900World` preflights every participating root and fails
  closed for missing or malformed state 5900 data. Available roots enter state
  5900 after the round reset through the existing state-entry owner.
- Round snapshots expose match score and state-5900 evidence only after a
  transition, preserving initial-round behavior checksums and existing public
  snapshot shape.
- The required trace uses imported CNS/AIR state 5900 data, a completed draw,
  round 2 publication, both roots entering 5900, and final match score fields.

## Evidence

- Match-outcome, state-5900, Playable, round, and trace focal suites pass after
  the final closeout run.
- `pnpm qa:trace` passes 599/599 artifacts: 565 required and 34 optional;
  required artifact `synthetic-imported-match-outcome-state-5900` is green.
- TypeScript 7 typecheck, production build, architecture boundaries, and CSS
  budget pass.
- Desktop/mobile Runtime and Studio smoke pass. Evidence is under
  `.scratch/qa/qa-smoke-match-outcome-5900/`.

## Claim Ceiling

This closes bounded score adjudication and imported state-5900 entry at the
next-round boundary. It does not claim exact winpose/motif ownership, all
state-5900 controller breadth, complete `copyVar` map/remap/dialogue
persistence, automatic Turns continuation, rollback/netplay, or full
MUGEN/IKEMEN parity.
