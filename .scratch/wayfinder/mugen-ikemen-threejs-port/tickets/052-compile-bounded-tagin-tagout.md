# Compile bounded TagIn and TagOut

Type: research
Status: open
Blocked by: None

## Question

What minimum TagIn/TagOut parameter subset can compile into typed operations, mutate standby state during P3-P8 CNS execution, and refresh root participation/selection in the same tick without adding gameplay consumers?

## Acceptance direction

- Source-map every supported parameter to pinned IKEMEN bytecode.
- Same-tick before/after active-root and selection evidence.
- Invalid partner/id/state transitions fail closed.
- No input/combat/round/presentation/resource widening.
