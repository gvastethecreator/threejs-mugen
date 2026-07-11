# IKEMEN structural root-activation checkpoint

## Outcome

Explicit IKEMEN matches can atomically change root standby state and expose plural active roots by side without widening gameplay.

## Evidence

- Invalid batch leaves prior state unchanged.
- P1/P3 can both be structurally active; P1-to-P3 swap is deterministic.
- Activated P3 stays reserved with every executable axis false.
- Reset restores P1/P2 active and reserves standby.
- Full gates: 165 files / 1612 tests; 538/538 traces (507 required, 31 optional); TypeScript 7 typecheck/build; boundaries and diff check pass. Build retains the known large-chunk warning.

## Global areas

| Area | Status |
| --- | --- |
| Runtime | Structural activation only. |
| IKEMEN | Plural active-root read model added. |
| Studio/renderer | Unchanged. |
| Score | Unchanged. |

## Blocked

CNS TagIn/TagOut, redirects, scheduling, input, combat, round, presentation, resources, and full parity.
