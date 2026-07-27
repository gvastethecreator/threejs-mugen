# T407 Projectile `air.juggle`

Type: task

Status: resolved bounded in `1899eb97`

## Question

Can root-owned CNS Projectiles carry `air.juggle` through compilation and
spawn, spend the IKEMEN target budget on falling contacts, reject later
over-budget contacts, and preserve the existing MUGEN/helper paths?

## Contract

- `ProjectileControllerOp` and `RuntimeProjectile` expose optional `airJuggle`.
- IKEMEN admission runs after `HitBy` and before `HitOverride` for root-owned
  projectiles.
- Falling contacts spend `data.airjuggle` points by attacker id.
- `NoJuggleCheck` bypasses without spending and projectile contact never resets
  attacker `c.juggle`.
- Rejection leaves the projectile active and records `via air.juggle`.
- Non-IKEMEN profiles and child/helper projectiles keep the prior behavior.

## In scope

Compiler, projectile spawn, combat bridge/profile propagation, bounded
RuntimeJuggle helpers, snapshots, focused tests, required trace, research,
roadmap, and backlog evidence.

## Out of scope

Exact `hittmp`, helper/nested projectile ownership, MUGEN branch parity,
teams/clashes, `ModifyHitDef air.juggle`, global checkpoint, scores, and full
port parity.

## Evidence

- Official source note: `docs/research/2026-07-27-ikemen-projectile-air-juggle.md`.
- Required artifact: `synthetic-imported-ikemen-projectile-air-juggle-golden`.
- Focused suites: compiler, projectile spawn/combat, RuntimeJuggle, and trace
  gate tests.
- `node --check scripts/qa_traces.cjs` and `git diff --check` pass.
- Feature commit: `1899eb97 feat(runtime): add projectile air juggle budget`.
- `pnpm typecheck` remains blocked by the pre-existing unused `advanced` in
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`; no owned file reports a
  type error in the focused transform/test path.
