# Choose next runtime compatibility gap

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded R1/R2 runtime gap should be implemented next to move the port measurably toward fuller MUGEN compatibility without weakening evidence quality?

## Answer

Resolved for the latest passes: after the bounded dynamic `AfterImage` typed sprite-effect telemetry gap, implement bounded dynamic `EnvShake` typed telemetry, then close the adjacent bounded dynamic `EnvColor value/time/under` typed telemetry gap.

Evidence: required `synthetic-imported-envshake-dynamic.json` has trace checksum `e1bf593f` / final checksum `8f52f1f4`, records typed `envshake`, and preserves camera-shake telemetry `time = 18`, `freq = 45`, `ampl = -9`, `phase = 0.25`. Required `synthetic-imported-envcolor-dynamic.json` now has trace checksum `845c3d5e` / final checksum `282fc77f`, records typed `envcolor`, and preserves stage-frame flash telemetry `color = 32,128,240`, `under = true`. `pnpm qa:trace` passes 523/523 artifacts with 492 required and 31 optional.

Next candidate inputs after this slice: `.scratch/roadmap/issues/01-runtime-compatibility-gates.md`, `docs/WORKPLAN.md`, current `pnpm qa:trace` coverage, and the latest blocked claims around renderer parity, helper/redirect ownership, exact presentation timing, and simple parser-only controllers that can become typed no-crash runtime operations.
