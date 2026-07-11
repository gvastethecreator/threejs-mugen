# IKEMEN expression-selection checkpoint

## Outcome

Read-only expression contexts can resolve EnemyNear and P2 from distinct multi-root candidate policies without changing existing 1v1 callers.

## Evidence

- Distinct P2 and Enemy candidates with unique identity/life values.
- Nearest Enemy ordering remains deterministic.
- Empty explicit P2 selection fails closed.
- Full gates: 166 files / 1615 tests; 538/538 traces (507 required, 31 optional); TypeScript 7 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.

## Blocked

Automatic match-loop wiring, Partner redirects, standby CNS scheduling, TagIn/TagOut, mutation, gameplay consumers, and full parity.
