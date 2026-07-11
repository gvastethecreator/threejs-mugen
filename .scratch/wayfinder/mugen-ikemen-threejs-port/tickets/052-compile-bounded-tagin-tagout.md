# Compile bounded TagIn and TagOut

Type: research
Status: resolved
Blocked by: None

## Question

What minimum TagIn/TagOut parameter subset can compile into typed operations, mutate standby state during P3-P8 CNS execution, and refresh root participation/selection in the same tick without adding gameplay consumers?

## Acceptance direction

- Source-map every supported parameter to pinned IKEMEN bytecode.
- Same-tick before/after active-root and selection evidence.
- Invalid partner/id/state transitions fail closed.
- No input/combat/round/presentation/resource widening.

## Answer

Start with parameterless self-targeted TagIn/TagOut only. TagIn clears caller standby; TagOut sets it. Any optional parameter fails closed for this route. Do not infer a partner transition. Compile one typed standby mutation and refresh live root selection between controller phases. See `docs/research/2026-07-11-ikemen-bounded-tagin-tagout.md`.
