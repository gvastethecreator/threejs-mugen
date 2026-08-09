# Issue 137 — Ikemen ModifyProjectile animation mutation

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align numeric ModifyProjectile `projanim` mutation with pinned Ikemen source:
selected live Projectiles replace their active AIR action and reset the local
animation cursor when the animation identity changes.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates `projectile_projanim`
inside ModifyProjectile, writes the selected Projectile animation number and
namespace, and replaces the active animation reference when the identity
changes. An invalid animation is allowed to invalidate/destroy the Projectile
in upstream runtime.

## Acceptance fixture

- Compile static numeric `projanim` into the typed ModifyProjectile operation.
- Resolve dynamic numeric `projanim` through the existing bounded expression
  resolver.
- Resolve the replacement AIR action through the Projectile sprite owner's
  animation table for root-owned and helper-parented paths.
- Replace `animNo` and `action`, then reset `frameIndex` and `frameElapsed`
  only when the animation number changes.
- Preserve T561 owner/ID/index selection and leave unselected Projectiles
  unchanged.

## Claim ceiling

Do not claim FightFX/common animation namespaces, string-prefix parity,
redirected sprite-owner changes, exact invalid-animation destruction timing,
exact tick order, rollback/netplay serialization, or complete
ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Numeric `projanim` mutation replaces animation identity and the active animation reference only when the identity changes. |
| Adapted | Local AIR actions come from the current root/helper animation map, and the explicit `frameIndex`/`frameElapsed` cursor resets to zero. |
| Replaced | Invalid or empty local actions fail closed and preserve the current animation instead of following upstream destruction timing. |
| Omitted | FightFX/common string namespaces, exact invalid-animation destruction, tick order, and rollback serialization. |
| Local extension | `RuntimeProjectileModifyInput.resolveAction` keeps action lookup outside the typed projectile state mutator. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, EffectActorSystem, and EffectSpawnSystem:
  4 files / 191 tests pass.
- PlayableMatchRuntime focused dynamic ModifyProjectile gate: 1 test passes.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` pass.
- `pnpm qa:trace` passes 686/686 artifacts (652 required, 34 optional).
- The full suite retains the inherited 13 failed files / 58 failures with
  3382/3440 tests passing.
