# T344 - HelperVar ownprojectile read

Status: resolved at bounded Helper-local query scope
Date: 2026-07-20
Feature commit: `8bd3ba2c`

## Question

How can an IKEMEN Helper read its explicit `ownprojectile` state from CNS
without making the MUGEN profile or unsupported HelperVar fields executable?

## Source evidence

The pinned Ikemen-GO bytecode exposes `HelperVar` for Helpers and returns the
stored `ownProjectile` flag for the `ownprojectile` key. A non-Helper returns
an undefined value through the upstream bytecode path.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Expression compilation recognizes `HelperVar(ownprojectile)` as an
  executable supported expression while leaving other HelperVar keys outside
  the supported set.
- The runtime evaluator returns `1` only for an active `ikemen-go` Helper with
  explicit ownership and returns `0` for explicit false, missing ownership,
  root context, and legacy profiles.
- The Helper micro-VM now carries the profile-scoped value into trigger and
  controller evaluation.
- Direct evaluator, compiler classification, and Helper controller tests cover
  true, false, root, and legacy-profile reads.

## Verification

- Focused Vitest passed: 3 files / 112 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` is clean for the feature write-set.
- Browser smoke is deferred because this slice changes expression/runtime
  evaluation only; no renderer, Studio, or browser route changed.

## Claim ceiling

This closes the current Helper-local `HelperVar(ownprojectile)` read for the
tested IKEMEN context. Other HelperVar fields, redirected Parent/Root reads,
undefined-value fidelity, dynamic ownership mutation after spawn, trace
artifact coverage, and complete MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`HelperVar` dispatch and
  `OC_ex3_helpervar_ownprojectile`)
