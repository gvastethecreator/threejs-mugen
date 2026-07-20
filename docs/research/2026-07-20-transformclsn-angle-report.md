# T359 research report: TransformClsn angle

Date: 2026-07-20

## Question

Can the runtime carry the Ikemen `TransformClsn angle` modifier through the
typed CNS/controller path and use it in root and direct Helper collision
queries without rotating size boxes?

## Primary source

The pinned local Ikemen-GO checkout and the official revision define the
controller parameter, per-tick angle accumulation, size-box exception, and
rotated rectangle test:

- [`compiler_functions.go` TransformClsn parameters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6704-L6726)
- [`bytecode.go` angle execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14690-L14718)
- [`char.go` size-box collision exception](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10236-L10285)
- [`system.go` collision transform dispatch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1948-L2008)
- [`common.go` SAT rectangle intersection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go#L286-L340)

Ikemen rotates each rectangle around its world position using
`-Rad(angle * facing)`. It uses inclusive projection overlap for the rotated
path and uses an unrotated, locally scaled size-box path when the box type is
`size`.

## Implementation

`RuntimeCollisionTransformSystem.ts` now owns the typed angle field,
expression resolution, per-tick accumulation, and reset. The compiler lowers
static angle values while the runtime resolver keeps non-static values on the
controller boundary. `StateControllerExecutor.ts` reports unresolved scale
and angle fields independently when a mixed controller only applies one side.

`CombatResolver.ts` projects the actor box into world coordinates and attaches
rotation metadata only when the active angle is non-zero. Its rotated path
builds rectangle corners, derives edge normals for both boxes, projects both
sets onto every axis, and accepts inclusive ranges. The pre-existing strict
axis-aligned path remains unchanged. `PlayableMatchRuntime.ts` marks size
queries so the angle metadata is suppressed before contact resolution.

Helpers carry the angle through their runtime state for direct Helper combat.
Root proxy merge still publishes boxes in root-local geometry without a
proxy-local rotation composition.

## Evidence

- `RuntimeCompiler.test.ts` covers static angle lowering.
- `RuntimeCnsSubset.test.ts` covers scale and angle accumulation, reset-facing
  executor behavior, and independent unresolved-field reporting.
- `CombatResolver.test.ts` covers rotated contact and the size-box exclusion.
- `RuntimeTraceGatePresets.test.ts` covers the synthetic imported artifact and
  exact actor-frame angle bounds.
- `pnpm qa:trace` passed with `636/636` artifacts: `602` required and `34`
  optional, with no failed or skipped fixtures.
- TypeScript 7 typecheck, production build with `328` modules, boundary check,
  focused tests, and `git diff --check` passed.

## Limits and next work

The current block does not compose angle through root Helper proxies,
projectile-local geometry, size-box scaling, exact upstream coordinate and
animation-local scale order, or the old axis-aligned edge-touch policy. It
also does not provide browser proof, upstream/local differential traces,
renderer parity, or complete MUGEN/IKEMEN parity.
