# Wayfinder 135 - TeamRoundDecision/v0 read model

Status: resolved bounded read-model cut

Dependency: Wayfinder 134 / ADR 0003 global AssertSpecial ownership.

## Answer

`RuntimeTeamRoundDecisionWorld/v0` now separates actor KO, `overKo`, side
defeat, winner side, and Turns replacement-required state for explicit
single/simul/tag/turns policies. It keeps `RoundNotOver` as an outcome block,
excludes Helpers from team-round ownership, and requires explicit healthy
standby replacement eligibility.

## Evidence

- `src/mugen/runtime/RuntimeTeamRoundDecisionSystem.ts`
- `src/mugen/runtime/RuntimeMatchRoundSystem.ts`
- `src/tests/RuntimeTeamRoundDecisionSystem.test.ts`
- `docs/research/2026-07-13-team-round-decision.md`
- `docs/adr/0004-runtime-team-round-decision.md`

## Claim allowed

Deterministic read-only team decision facts for the covered policies and actor
inputs, without changing pair-round mutation.

## Claim blocked

Required ordered KO/handoff traces, actual replacement transaction, broad
Simul/Tag/Turns timing, lifebars/resources, score flow, rollback, and full
MUGEN/IKEMEN parity.
