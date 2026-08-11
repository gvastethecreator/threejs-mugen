# T704: fresh Projectile `projanim` in caller context

Status: `active`

## Goal

Resolve fresh root- and Helper-authored Projectile `projanim` expressions at
spawn time. Keep the existing animation lookup, ownership, and lifecycle
paths. Do not broaden this cut to live `ModifyProjectile` animation mutation.

## Source contract

- M.U.G.E.N 1.1 documents `projanim = anim_no (int)`, with default `0` when
  the parameter is omitted: `.scratch/external/mugen-1.1b1/docs/sctrls.html`
  near the Projectile parameter table (`projanim`).
- The pinned Ikemen-GO source `149402fa` compiles `projanim` as one `VT_Int`
  expression in `src/compiler_functions.go` near `projectile_projanim`.
- The pinned runtime evaluates the expression in the original caller context
  in `src/bytecode.go` near the `projectile_projanim` case and stores the
  resulting action in the Projectile. Invalid actions use the existing local
  action-lookup failure path.

## Local gap

`ProjectileControllerOp.projAnim` and both fresh spawn seams currently keep
only a static number. A dynamic `projanim = var(0)` therefore falls through to
the local `0` fallback instead of selecting the caller-resolved action.

## Port ledger

| Behavior | Local treatment | Evidence target |
| --- | --- | --- |
| Integer `projanim` parameter and omitted default `0` | `copied`, with the local static fallback retained | Compiler and spawn tests |
| Caller-context expression evaluation | `adapted` through a typed one-shot resolver | Root and Helper traces |
| Local AIR action lookup and playable-action guard | `replaced` by the existing Three.js animation map seam | Spawn tests and lifecycle trace |
| Ikemen `ModifyProjectile` live animation broadcast | `omitted` from T704 | Focused exclusion test and issue ledger |
| FFX animation prefix and exact invalid-action warning/removal timing | `omitted` from T704 | Blocked claim |
| Root/Helper ownership, target links, and lifecycle telemetry | `local extension` | Required trace artifacts |

## Acceptance

1. The compiler preserves one supported static or dynamic `projanim` value.
2. Root and Helper fresh Projectiles resolve the value once in the original
   caller context before action lookup.
3. Omission keeps action `0`; malformed or unsupported expressions fail closed.
4. Root and Helper traces prove selected action, spawn/active/remove lifecycle,
   ownership, and target payload without a direct `ModifyProjectile` claim.
5. Existing static Projectile animation and terminal-animation behavior stays
   unchanged.

## Claim allowed

Fresh root- and Helper-authored Projectiles can select a finite integer AIR
action from a caller-context `projanim` expression, with bounded local action
lookup and lifecycle evidence.

## Claim blocked

Live `ModifyProjectile` animation mutation, FFX-prefixed animation references,
exact invalid-action warning/removal timing, multi-projectile broadcast order,
teams/simul, rollback, and full M.U.G.E.N/Ikemen Projectile animation parity.

## Closeout commands

```powershell
pnpm vitest run src/tests/RuntimeCompiler.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/EffectActorSystem.test.ts src/tests/ProjectileSystem.test.ts
pnpm typecheck
pnpm build
pnpm qa:trace
git diff --check
```
