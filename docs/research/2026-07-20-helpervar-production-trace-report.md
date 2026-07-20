# Implementation report: HelperVar production trace

Date: 2026-07-20
Area: imported runtime trace coverage
Scope: T346, required HelperVar route

## Result

The required runtime corpus now contains an imported Helper route that
branches on all three supported `HelperVar` fields. The fixture runs with the
`ikemen-go` profile, authors `keyctrl = 1` and `ownprojectile = 1`, and proves
the Helper reaches state `1214` / animation `934` only after the three reads
pass.

## Implementation

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` adds
  `helperVarRoute`, its CNS generator, animation registration, and
  `createSyntheticImportedHelperVarTraceArtifact`.
- `scripts/qa_traces.cjs` registers `synthetic-imported-helpervar` as a
  required artifact.
- `src/tests/RuntimeTraceGatePresets.test.ts` checks the artifact status,
  Helper lifecycle, actor frame, and effect payload.

The route is intentionally explicit. The trace does not infer an Ikemen
profile from the fixture source, which prevents a legacy profile from
silently passing a profile-specific HelperVar contract.

## Evidence

- Feature commit: `3b900d01`.
- Preset suite: `619/619`.
- Trace corpus: `634/634`, with `600` required and `34` optional artifacts.
- TypeScript 7 typecheck: passed.
- Production build: `326` modules, passed.
- Repository boundary check: passed.

Known warnings remain the existing jsdom canvas context notice and Vite large
chunk notice. Browser smoke is not part of this runtime-only slice.

## Claim ceiling

The evidence covers the current Helper-local `id`, `keyctrl`, and
`ownprojectile` reads in one imported `ikemen-go` route. It does not establish
the unsupported `HelperVar` fields, nested Helpers, redirected contexts,
undefined-value fidelity, dynamic mutation, or full MUGEN/IKEMEN parity.

## Primary source

- [Ikemen-GO `bytecode.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go)
- `.scratch/external/Ikemen-GO/src/bytecode.go`

