# 61 - T476 M.U.G.E.N/Ikemen `down.velocity.x` propagation

Status: closed-bounded
Labels: mugen, ikemen, runtime, hitdef, projectile
Lane: runtime / combat
Priority: P1
Depends on: T475 `air.fall` airborne-only selection

## Objective

Carry the horizontal component of `down.velocity` through the existing
HitDef, ModifyHitDef, imported-character, projectile and direct-combat seams.
When a defender is already in the lie-down state (`stateType = L`), an
authored horizontal value must replace the generic hit push and remain visible
through the runtime hit velocity. Moves that do not carry this field keep the
legacy synthetic fallback until their source provides an authored velocity.

## Source contract

Elecbyte documents `down.velocity = x_velocity, y_velocity` as the velocity
assigned to P2 when P2 is lying down; omitted `down.velocity` inherits the
`air.velocity` values. The official Ikemen-GO `src/char.go` reset path also
defaults each down-velocity component from `air_velocity`, then applies the
horizontal component to `GetHitVar.xvel` for a grounded lie-down target.

Sources:

- [M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go)

## Scope

- Add a typed `downVelocityX` field to runtime move/attack data.
- Preserve the parsed X component for normal HitDef and ModifyHitDef updates.
- Materialize the component for imported state moves and player-owned
  projectiles, including authored `air.velocity` fallback.
- Apply the field in attacker-relative coordinates only for lie-down hits;
  standing, crouching, airborne and guard paths keep their existing push/X
  behavior.
- Add focused resolver, direct, projectile, parser and imported metadata
  regression tests.

## Acceptance

- Focused tests prove authored X survives compiler/runtime seams and produces
  the expected signed target velocity for direct and projectile contacts.
- Existing tests and trace checksums remain stable unless a drift is directly
  caused by a source-authored lie-down X velocity and is documented here.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- `pnpm qa:smoke` is not required unless a visible surface changes.

## Claim ceiling

This slice does not claim full Z velocity, full GetHitVar lifetime, exact
Common1 lie-down tick order, custom-state/Helper/Team ownership, collision
physics, or full M.U.G.E.N/Ikemen parity.

## Evidence

- `pnpm exec vitest run src/tests/CombatResolver.test.ts src/tests/HitDefSystem.test.ts src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/ProjectileSystem.test.ts src/tests/importedFighter.test.ts src/tests/RuntimeCompiler.test.ts`: 7 files / 247 tests passed.
- `pnpm test`: 324 files / 3308 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`: pass; trace coverage is 682/682 artifacts (648 required, 34 optional), with no checksum drift requiring a rebaseline.
- `git diff --check`: pass; CRLF normalization warnings are pre-existing workspace hygiene only.
- `pnpm qa:smoke`: not run; this is a runtime/parser/combat slice with no visible surface change.

The bounded claim is closed: authored/default horizontal `down.velocity` now
reaches direct and projectile lie-down contacts with the official sign, while
synthetic payloads without the field retain the compatibility push fallback.
