# 62 - T477 M.U.G.E.N/Ikemen `fall.xvelocity` signed bounce

Status: closed-bounded
Labels: mugen, ikemen, runtime, hitfall, physics
Lane: runtime / combat
Priority: P1
Depends on: T476 `down.velocity.x` propagation

## Objective

Preserve authored `fall.xvelocity` as a signed bounce velocity through direct
and projectile fall materialization. The value must not be mirrored by the
attacker/projectile facing; omitted X remains an explicit no-change value.

## Source contract

Elecbyte documents `fall.xvelocity` as the X velocity P2 receives when
bouncing off the ground and says omitted X means no change. Ikemen-GO stores
the authored value directly in `GetHitVar.fall_xvelocity` and `HitFallVel`
assigns it without a facing transform.

Sources:

- [M.U.G.E.N controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go)

## Scope

- Stop applying attacker/projectile facing and absolute-value normalization to
  direct/projectile `fall.xvelocity`.
- Keep Y localcoord defaults and all authored/omitted precedence unchanged.
- Add direct and projectile regressions with negative authored X and opposite
  facing to prove the signed value survives.

## Acceptance

- Focused direct/projectile/HitFall tests prove signed authored X is preserved.
- Existing runtime and trace behavior remains stable except for the deliberate
  source-shaped fall-X orientation correction.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- `pnpm qa:smoke` is not required unless a visible surface changes.

## Claim ceiling

This slice does not claim exact Common1 landing physics, fall-X friction or
acceleration, Z velocity, dynamic-expression breadth, custom-state/Helper/Team
ownership, or full M.U.G.E.N/Ikemen parity.

## Evidence

- `pnpm exec vitest run src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/HitFallControllerSystem.test.ts src/tests/CombatResolver.test.ts`: 4 files / 121 tests passed.
- `pnpm test`: 324 files / 3310 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`: pass; trace coverage remains 682/682 artifacts (648 required, 34 optional) with no checksum drift requiring a rebaseline.
- `git diff --check`: pass; CRLF normalization warnings are workspace hygiene only.
- `pnpm qa:smoke`: not run; this runtime-only correction does not change a visible surface.

The bounded claim is closed: direct and projectile fall materialization now
preserves authored signed `fall.xvelocity`, including under opposite facing,
while omitted X stays a no-change value.
