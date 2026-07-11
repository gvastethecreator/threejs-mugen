# IKEMEN live team-state checkpoint

## Outcome

Runtime roots and Helpers now expose `teamState` through snapshots. `MatchWorld.teamRoster` consumes live disabled/standby/over-KO/player-type values instead of permanently inferring eligibility from actor kind.

## Evidence

- Focused: 3 files / 28 tests.
- Full gates: 163 files / 1605 tests; 538/538 traces (507 required, 31 optional); TypeScript 7.0.2 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.
- No visual gate: snapshot/diagnostic contract only.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Team state is observable; live match remains 1v1. |
| IKEMEN compatibility | Source-backed root/helper eligibility state reaches public diagnostics. |
| Studio | Data available for future diagnostics; UI unchanged. |
| Renderer/assets/scanner | Unchanged. |
| Overall score | Unchanged; no team construction or gameplay. |

## Blocked

Helper player-type compilation, state-5150 over-KO integration, tag/turns transitions, P3/P4 construction, scheduling/input/effect stores/combat/round/presentation, shared resources, and full IKEMEN parity.
