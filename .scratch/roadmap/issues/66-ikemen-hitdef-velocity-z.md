# 66 - T481 Ikemen-GO HitDef velocity Z propagation

Status: closed-bounded
Labels: ikemen, runtime, combat, depth
Lane: runtime / combat
Priority: P1
Depends on: T480 `fall.zvelocity` depth propagation

## Objective

Preserve the authored third component of Ikemen-GO HitDef velocity vectors
through direct and projectile contact. Ground, air, down, guard and airguard
contexts select their own Z value; omitted Z remains absent and does not invent
depth motion.

## Source contract

The official Ikemen-GO state-controller reference documents three-component
`ground.velocity`, `air.velocity`, `down.velocity`, `guard.velocity` and
`airguard.velocity`, with the third component specifying Z velocity. The
runtime already owns `combatDepth.velocity`; this slice binds the authored
contact result to that seam without claiming the full Z physics model.

Source: [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters)

## Scope

- Parse optional HitDef vector Z values in the typed compiler and imported
  state path.
- Carry the same values through player-owned projectiles.
- Select ground/air/down/guard/airguard Z at combat resolution and write an
  explicit result into defender `combatDepth.velocity` plus hit metadata.
- Keep existing X/Y semantics, omitted-Z behavior, and fall metadata unchanged.

## Acceptance

- Focused compiler, HitDef, resolver, direct-combat, imported-fighter,
  projectile and projectile-combat tests pass.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- No browser smoke is required; no visible surface changes.

## Claim ceiling

This slice does not claim Common1 Z acceleration/friction, full M.U.G.E.N Z
physics, ModifyHitDef Z mutation, helper/team ownership breadth, or complete
Ikemen/M.U.G.E.N depth parity.

## Evidence

- Focused compiler/HitDef/resolver/direct/projectile/imported-fighter coverage:
  251/251 tests passed.
- Final suite: 324 files / 3317 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`
  682/682 artifacts and `git diff --check` passed.
- Score movement: none.
