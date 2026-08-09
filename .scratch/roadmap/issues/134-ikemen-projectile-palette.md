# Issue 134 — Ikemen Projectile palette ownership

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official spawn-only Projectile `ownpal` and `remappal` through typed state,
bounded palette routing, snapshots, and `ProjVar(DrawPal.Group/Index)` reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `ownpal` as one boolean and
`remappal` as two integers. New Projectiles inherit their owner's PalFX by
default. Positive `ownpal` creates an independent PalFX while preserving the
current remap and then applies the requested palette. ModifyProjectile leaves
both cases commented out as unsupported. `ProjVar` reads the resulting draw
palette group and index. The source is MIT licensed.

## Acceptance fixture

- Compile static `ownpal` and two-value `remappal` only on Projectile spawn.
- Store bounded ownership and draw-palette state without inventing
  ModifyProjectile support.
- Route an authored independent palette into the existing sprite lookup seam and
  expose it in effect/runtime/trace snapshots.
- Return official bounded draw-palette group/index values through `ProjVar`.

## Claim ceiling

Do not claim exact PalFX copy/tick lifetime, arbitrary palette banks, truecolor
or PNG remap, ModifyProjectile palette mutation, dynamic controller values,
helper/root palette sharing, rollback/netplay serialization, or complete
Projectile palette parity.

## Closure ledger

- Static spawn-only `ownpal` and exact two-value `remappal` compile into typed
  Projectile operations; ModifyProjectile intentionally exposes neither.
- Runtime state keeps palette ownership, draw-palette group/index, and a cloned
  bounded `[1,1] -> destination` lookup remap for the existing sprite provider.
- Effect/runtime snapshots and the existing trace projection carry the remap;
  `ProjVar(DrawPal.Group/Index)` reads the retained draw palette.
- Disabled `ownpal`, omitted values, and dynamic/invalid remaps fail closed.

## Verification

- `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/ProjectileSystem.test.ts src/tests/RuntimeCnsSubset.test.ts src/tests/RuntimeExpressionContextSystem.test.ts src/tests/CharacterRenderer.test.ts --reporter=dot` — 5 files / 183 tests passed.
- `pnpm typecheck` — passed.
- `pnpm build` — passed; existing chunk-size warning only.
- `pnpm check:boundaries` — passed.
- `pnpm check:redirect-boundary` — passed.
- `pnpm qa:trace` — 686/686 passed (652 required / 34 optional).
- `git diff --check` — passed; existing line-ending warnings only.
