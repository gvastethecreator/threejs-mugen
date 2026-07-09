# EnvColor Dynamic Typed Telemetry Research

Date: 2026-07-09

## Question

Can bounded dynamic `EnvColor value/time/under` params be promoted from raw fallback-only stage-flash evidence into typed `envcolor` operation telemetry without claiming exact presentation parity?

## Answer

Yes. Elecbyte defines `EnvColor` through `value`, `time`, and `under`, and controller params can be expression-backed at execution time. The runtime can resolve the dynamic params through the existing active controller expression context, record a resolved typed `envcolor` operation, and keep the same bounded stage-flash evidence.

## Sources

- Elecbyte State Controller Reference, M.U.G.E.N 1.0 docs, updated 2010-09-13: https://www.elecbyte.com/mugendocs/sctrls.html
- Elecbyte CNS format docs, M.U.G.E.N 1.0 docs: https://www.elecbyte.com/mugendocs/cns.html
- Local trace artifact: `.scratch/qa/trace-gates/synthetic-imported-envcolor-dynamic.json`
- Local focused tests: `src/tests/EnvColorSystem.test.ts`, `src/tests/RuntimeTraceGatePresets.test.ts`

## Findings

- `EnvColor` exposes RGB `value`, frame `time`, and `under` layer params.
- CNS state-controller params can use arithmetic expressions and are evaluated as controller data at runtime.
- Existing active-state dispatch already has a resolver for owner-local `var(...)` values after `VarSet` seeds execute.
- Fresh `pnpm qa:trace` produced `synthetic-imported-envcolor-dynamic.json` checksum `845c3d5e` / final checksum `282fc77f`, with `envcolor: 1`, `variable:varset: 5`, `hitdef: 1`, and stage-frame evidence `color = 32,128,240`, `under = true`.

## Uncertainty

This does not prove exact MUGEN/IKEMEN blend math, layer/window behavior, pause timing, renderer parity, helper/redirect presentation ownership, score movement, or full presentation parity.

## Decision Impact

Promote dynamic `EnvColor` from fallback-only stage telemetry to bounded typed operation telemetry. Keep score unchanged and keep blocked-scope wording explicit in roadmap/support docs.
