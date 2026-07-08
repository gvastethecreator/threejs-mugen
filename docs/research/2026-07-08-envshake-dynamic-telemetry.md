# EnvShake Dynamic Telemetry Research

Date: 2026-07-08

## Question

Can bounded dynamic `EnvShake time/freq/ampl/phase` params be promoted from raw fallback-only evidence into typed `envshake` operation telemetry without broad camera parity claims?

## Answer

Yes. Elecbyte defines numeric state-controller params as expression-capable unless specified otherwise, and `EnvShake` exposes numeric `time`, `freq`, `ampl`, and `phase` params. The repo can resolve those params through the existing active controller expression context, record a resolved typed `envshake` operation, and keep the current camera-shake event telemetry.

## Sources

- Elecbyte State Controller Reference, M.U.G.E.N 1.0 docs, updated 2010-09-13: https://www.elecbyte.com/mugendocs/sctrls.html
- Local trace artifact: `.scratch/qa/trace-gates/synthetic-imported-envshake-dynamic.json`
- Local focused tests: `src/tests/EnvShakeSystem.test.ts`, `src/tests/RuntimeTraceGatePresets.test.ts`

## Findings

- Elecbyte marks numeric state-controller params expression-capable by default, with bottom resolving to `0`.
- `EnvShake` requires `time`; `freq`, `ampl`, and `phase` are optional numeric params with documented defaults and camera-shake roles.
- Existing runtime dispatch already has the active expression context needed to resolve owner-local `var(...)` and `fvar(...)` values at controller execution time.
- Fresh `pnpm qa:trace` produced `synthetic-imported-envshake-dynamic.json` checksum `e1bf593f` / final checksum `8f52f1f4`, with `envshake: 1`, `variable:varset: 4`, `hitdef: 1`, and runtime shake event `time = 18`, `freq = 45`, `ampl = -9`, `phase = 0.25`.

## Uncertainty

This does not prove `mul`, exact MUGEN/IKEMEN waveform shape, pause/stage/layer interaction, helper ownership, screenpack ownership, or full presentation parity.

## Decision Impact

Promote dynamic `EnvShake` from fallback-only telemetry to bounded typed operation telemetry. Keep score unchanged and keep blocked-scope wording explicit in roadmap/support docs.
