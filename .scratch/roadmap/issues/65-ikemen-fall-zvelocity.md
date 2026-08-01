# 65 - T480 Ikemen-GO `fall.zvelocity` depth propagation

Status: closed-bounded
Labels: ikemen, runtime, combat, depth
Lane: runtime / combat
Priority: P1
Depends on: T477 signed `fall.xvelocity`

## Objective

Preserve authored Ikemen-GO `fall.zvelocity` through HitDef/projectile
materialization and apply it to the defender's existing combat-depth velocity
when `HitFallVel` executes. Omitted Z remains a no-change value.

## Source contract

Ikemen-GO stores `fall_zvelocity` in `GetHitVar`, copies it from the HitDef
fall group, and `hitFallVel()` assigns it directly to the character's depth
velocity only when it is authored. The same source keeps omitted fall X/Z as
NaN/no-change while retaining the authored Y fallback.

Source: [Ikemen-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Scope

- Parse `fall.zvelocity` on HitDef, imported state moves, projectiles and
  `HitFallSet`.
- Carry the optional value through direct/projectile fall metadata and expose
  `GetHitVar(fall.zvel|fall.zvelocity)`.
- Apply the authored value to `combatDepth.velocity` in `HitFallVel`; keep
  omitted Z and existing X/Y semantics unchanged.
- Add focused compiler, direct/projectile and hit-fall regressions.

## Acceptance

- Focused compiler/direct/projectile/HitFall tests pass.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- No browser smoke is required; no visible surface changes.

## Claim ceiling

This slice does not claim exact M.U.G.E.N Z support, down.velocity Z, Common1
bounce offsets/acceleration/landing tables, custom-state timing, helper/team
ownership, or full Ikemen/M.U.G.E.N depth-physics parity.

## Evidence

- Focused compiler/direct/projectile/HitFall/imported-fighter/expression-context
  tests: 7 files / 230 tests passed.
- Full suite: 324 files / 3316 tests passed; `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, `pnpm qa:trace` (682/682),
  `pnpm qa:content:stages` and `git diff --check` passed. Browser smoke is N/A.
