# T346 - Imported HelperVar production trace

Status: resolved at bounded imported trace scope
Date: 2026-07-20
Feature commit: `3b900d01`

## Question

How can the source-backed `HelperVar` fields stay observable in the real
runtime trace gate instead of remaining limited to evaluator and micro-VM
tests?

## Source evidence

The pinned Ikemen-GO bytecode reads the current Helper ID, key-control flag,
and `ownProjectile` flag from the active Helper context. The port already
holds those values in the typed Helper runtime, so the trace can exercise the
same profile boundary with an imported CNS route.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added an imported synthetic route that enables `keyctrl = 1` and
  `ownprojectile = 1` on the Helper controller.
- Added a Helper-local CNS branch that requires
  `HelperVar(id) = 42`, `HelperVar(keyctrl) = 1`, and
  `HelperVar(ownprojectile) = 1` before entering state `1214` / animation
  `934`.
- Added the route to the required `qa:trace` corpus as
  `synthetic-imported-helpervar`.
- Kept the trace profile explicit as `ikemen-go`; legacy and unknown profile
  behavior remains covered by focused runtime tests.

## Verification

- `RuntimeTraceGatePresets.test.ts`: `619/619` passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Browser smoke is deferred because this slice changes runtime trace
  fixtures and does not change renderer, Studio, or browser routes.

## Claim ceiling

This closes a required imported trace for the three currently supported
`HelperVar` fields in an `ikemen-go` Helper context. It does not claim nested
Helper identity, dynamic HelperVar writes, unsupported fields such as
`helpertype` or `ownpal`, undefined-value fidelity outside the bounded
context, or complete MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`HelperVar` dispatch)

