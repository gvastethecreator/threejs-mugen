# IKEMEN inert-root checkpoint

## Outcome

Explicit IKEMEN matches can own P3-P8 standby roots. They survive reset, appear in `reserveActors` and the public registry, and remain excluded from all playable/presentation phases.

## Evidence

- Focused: 4 files / 99 tests.
- Full gates: 163 files / 1608 tests; 538/538 traces (507 required, 31 optional); TypeScript 7.0.2 typecheck/build; boundaries and diff check pass. The repo-wide architecture scan keeps its assertion and now has an explicit 15-second I/O budget after measured full-suite runtime exceeded the implicit 5-second default.
- No visual gate: reserve roots are intentionally not rendered.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Owns inert roots; gameplay remains P1/P2. |
| IKEMEN compatibility | Interleaved reserve slots and standby initialization are source-backed. |
| Studio | Registry can inspect reserves; UI unchanged. |
| Renderer | Reserves intentionally absent. |
| Assets/scanner | Unchanged. |
| Overall score | Unchanged; no active team gameplay. |

## Blocked

Activation/tag transitions, active-root read model, scheduling/input/effect stores/combat/round/presentation, team lifebars/resources, and full IKEMEN parity.
