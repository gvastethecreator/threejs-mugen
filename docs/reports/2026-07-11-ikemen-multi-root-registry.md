# IKEMEN multi-root registry checkpoint

## Outcome

`RuntimeMatchActorRosterWorld` now exposes a parallel immutable unique-id character registry. `MatchWorldActorRegistrySnapshot` publishes `RuntimeTeamRoster/v0`, `byId`, and `teamSides` for player/helper records, including synthetic P1-P4 fixtures, while live `MatchWorld` construction and playable scheduling remain P1/P2.

## Evidence

- Focused: 2 files / 17 tests after adversarial hardening.
- Full gates: 163 files / 1605 tests; 538/538 traces (507 required, 31 optional); TypeScript 7.0.2 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.
- No visual gate: public diagnostics only; visible UI unchanged.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Public registry advance; playable loop remains 1v1. |
| IKEMEN compatibility | P1-P4 plus helper topology reaches the public MatchWorld registry. |
| Studio | Diagnostic data is available; no new UI yet. |
| Renderer/assets/scanner | Unchanged. |
| Overall score | Unchanged; no playable team match. |

## Blocked

Live standby/disabled/over-KO projection, multi-root construction/scheduling/input/effect stores/combat/round/presentation, tag transitions, shared resources, and full IKEMEN parity.
