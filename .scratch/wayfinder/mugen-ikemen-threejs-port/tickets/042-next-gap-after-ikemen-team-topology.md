# Choose next gap after IKEMEN team topology

Type: research
Status: resolved
Blocked by: None

## Question

What bounded active/standby character state and public multi-root roster diagnostic can be added before multi-root scheduling, so EnemyNear/P2 and tag eligibility do not reuse complete-team enumeration incorrectly?

## Candidate Inputs

- Pinned IKEMEN `SCF_standby`, disabled, root/player-type, EnemyNear, and P2-list rules.
- Current `RuntimeOpponentSelectionWorld`, helper opponent roster, MatchWorld actor registry, and snapshots.
- A synthetic four-root registry fixture that does not yet claim playable simul/tag combat.
- Stable 1v1 trace/checksum requirements.

## Answer

Add explicit `disabled`, `standby`, `overKo`, and `playerType` state to topology entries without yet changing the two-root playable scheduler. Complete opposing-team enumeration remains unchanged. `EnemyNear` candidates are active opposing roots; P2 candidates are active opposing player-types that have not reached `overKo`. `RuntimeTeamRoster/v0` exposes a serializable P1-P4-plus-helper diagnostic so future roster construction can be inspected before it is allowed into scheduling or combat.

Evidence: focused topology tests, TypeScript 7 typecheck, full suite/build/trace/boundary gates recorded in the 2026-07-11 checkpoint report.
