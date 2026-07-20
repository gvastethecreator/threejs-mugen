# T358 research report: TransformClsn scale

Date: 2026-07-20

## Question

Can the runtime carry the Ikemen `TransformClsn scale` modifier through the
typed CNS/controller path and expose its effect in root and Helper collision
queries?

## Primary source

The pinned local Ikemen-GO checkout and the official revision document the
controller parameters, bytecode accumulation, per-tick collision-scale update,
and Clsn1/Clsn2 intersection path:

- [`compiler_functions.go` TransformClsn parameters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6704-L6726)
- [`bytecode.go` scale execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14690-L14718)
- [`char.go` scale calculation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7692-L7713)
- [`char.go` collision checks](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)

The source keeps the size collision box outside this Clsn transform path and
resets the modifier as part of the character tick lifecycle.

## Implementation

`RuntimeCollisionTransformSystem.ts` owns the typed operation, expression
resolution, per-tick accumulation, reset, and collision-box scaling. The
compiler lowers static values, while the runtime resolver handles expressions
that cannot be lowered at compile time. Root controller dispatch and Helper
controller dispatch share the same state model.

`RuntimeFrameSystem.ts` applies the multiplier after `OverrideClsn` and to the
active move box. `RuntimeHelperCollisionSystem.ts` combines it with the
existing Helper/proxy scale selection. The existing combat and trace paths
consume these resolved boxes without adding a second collision policy.

## Evidence

- `RuntimeCompiler.test.ts` covers static pairs, omitted Y defaults, dynamic
  values, and `redirectid` preservation.
- `RuntimeCnsSubset.test.ts` covers static execution, dynamic accumulation,
  per-tick state, and the explicit angle gap.
- `RuntimeFrameSystem.test.ts` covers scale after collision overrides.
- `RuntimeHelperCollisionSystem.test.ts` covers Helper scale composition with
  proxy geometry.
- `RuntimeTraceGatePresets.test.ts` covers the synthetic imported production
  artifact and its collision-scale actor-frame gate.
- `pnpm qa:trace` passed with `635/635` artifacts: `601` required and `34`
  optional, with no failed or skipped fixtures.
- TypeScript 7 typecheck, production build with `328` modules, boundary check,
  and `git diff --check` passed.

## Limits and next work

The current block does not rotate rectangles for `TransformClsn angle`, scale
size boxes, or compose the full upstream `clsnScaleMul * animlocalscl` and
coordinate/local-space model. Browser proof, upstream/local differential traces,
projectile variants, Helper-owned projectiles, and complete MUGEN/IKEMEN parity
remain open.
