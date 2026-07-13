# Research - TeamRoundDecision/v0

Date: 2026-07-13
Status: source-backed bounded implementation

## Question

What can be modeled before implementing team KO, Turns replacement, and
round-transition mutation without widening the current pair-only runtime?

## Primary evidence

- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines `TeamMode` and `TeamSide` as explicit team context, not as a
  replacement for actor identity.
- [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  requires `RoundNotOver` to be asserted every tick while a win pose keeps the
  round open. The flag is therefore a decision gate, not a latched outcome.
- [Ikemen-GO pinned round source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
  separates per-character KO/over-KO state from side-level `roundEndDecision`
  and performs Turns promotion in a later `activateNextTurnsFighters` step.
- [Ikemen-GO release history](https://github.com/ikemen-engine/Ikemen-GO/releases)
  records both team-mode timer behavior and historical `RoundNotOver` fixes;
  profile-specific behavior must not silently enter the MUGEN lane.

## Local findings

- `RuntimeTeamTopologyWorld` already exposes root/helper side and live-state
  diagnostics, but it is not a round winner or replacement transaction.
- `RuntimeRoundSystem` is intentionally pair-owned and currently performs the
  final life/time-over mutation for P1/P2.
- `RuntimeGlobalAssertSpecialWorld/v0` now provides the per-tick
  `RoundNotOver` gate required before a team decision can be consumed.

## Decision

Implement a pure `RuntimeTeamRoundDecisionWorld/v0` read model with:

- explicit side mode (`single`, `simul`, `tag`, or `turns`);
- explicit per-side `LoseOnKO` policy;
- actor KO, `overKo`, side defeat, and winner kept as separate facts;
- Turns replacement candidates admitted only when a standby actor is marked
  `replacementEligible` by its future owner;
- deterministic actor ordering and diagnostics for duplicates, helpers,
  unknown sides, invalid life values, and invalid replacement shape;
- `RoundNotOver` exposed as a global outcome block without erasing side facts.

The read model is exposed through `RuntimeMatchRoundWorld` but is not wired to
mutate round state, swap roots, alter snapshots, or change trace checksums.

## Open boundary

This cut does not claim exact Simul/Tag/Turns rules, replacement timing,
multi-root combat, lifebars, resources, win poses, score promotion, rollback,
or full MUGEN/IKEMEN round parity. Required ordered KO/handoff traces remain
the next executable 046g gate.
