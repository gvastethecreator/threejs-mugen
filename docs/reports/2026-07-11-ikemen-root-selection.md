# IKEMEN root-selection checkpoint

## Outcome

`MatchWorld` exposes distinct Partner, Enemy, and P2 root candidate lists for every P1-P8 identity.

## Evidence

- Table coverage for standby, disabled, neutral, helper, and over-KO cases.
- Live selection refresh before and after P1/P3 activation.
- Full gates: 166 files / 1613 tests; 538/538 traces (507 required, 31 optional); TypeScript 7 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.
- No visual gate: no visible consumer changed.

## Blocked

Expression routing, nearest-distance P2 parity, redirected mutation, standby scheduling, gameplay consumers, and full parity.
