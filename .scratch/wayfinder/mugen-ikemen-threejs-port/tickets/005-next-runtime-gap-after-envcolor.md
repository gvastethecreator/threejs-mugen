# Choose next runtime gap after EnvColor

Type: research
Status: done
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented after dynamic `EnvColor` typed telemetry to keep moving the port toward MUGEN/IKEMEN compatibility without weakening evidence quality?

## Answer

Selected and completed: dynamic `AttackMulSet value` / `DefenceMulSet value` typed telemetry.

Why: static damage-scale already had typed evidence and raw dynamic fallback already mutated multipliers, but dynamic routes lacked resolved `damage-scale:*` telemetry. This kept the slice bounded, aligned with nearby dynamic-controller telemetry work, and avoided claiming exact damage formula parity.

Evidence: required `synthetic-imported-damage-scale-dynamic.json` trace checksum `3433b369` / final checksum `e3db6dd9`, typed `damage-scale:attackmulset` and `damage-scale:defencemulset`, event text `for 30`, final P2 life `970`, and `pnpm qa:trace` 524/524 artifacts with 493 required and 31 optional.
