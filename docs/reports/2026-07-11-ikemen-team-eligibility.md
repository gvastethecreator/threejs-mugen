# IKEMEN team-eligibility checkpoint

## Outcome

`RuntimeTeamTopologyWorld` now distinguishes complete membership from active EnemyNear/P2 eligibility and publishes the first serializable `RuntimeTeamRoster/v0` multi-root diagnostic with unambiguous candidate flags.

## Evidence

- Focused: `RuntimeTeamTopologySystem.test.ts` covers complete vs active lists and P1-P4 diagnostics.
- Full gates: 163 files / 1601 tests; 538/538 traces (507 required, 31 optional); TypeScript 7.0.2 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.
- TypeScript: direct 7.0.2 route; upgrade audit remains 0 errors / 0 warnings.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Structural advance only; two-root match remains unchanged. |
| IKEMEN compatibility | Active/standby/disabled/player-type eligibility is explicit and source-backed. |
| Studio/renderer/assets/scanner | Unchanged. |
| Overall score | Unchanged; no multi-root registry or playable team match yet. |

## Blocked

Multi-root registry/construction, distance ordering/cache semantics, scheduling, input, combat, round/presentation ownership, tag transitions, shared resources, and full IKEMEN parity.
