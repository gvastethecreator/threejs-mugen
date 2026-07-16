# Implement projectile trade and p2 collision policy/v1

Status: completed

## Question

What bounded runtime contract closes the next projectile compatibility gap after
`ProjTypeCollision`: exact projectile trade boxes and the IKEMEN `p2clsncheck` /
`p2clsnrequire` selectors?

## Authority

- IKEMEN GO's changed-controller documentation defines `p2clsncheck` as one of
  `Clsn1`, `Clsn2`, `Size`, or `None`, and `p2clsnrequire` as an independent
  required-box precondition.
- IKEMEN GO's `Char.projClsnCheckSingle` uses the projectile frame's `Clsn1`
  by default, forces both sides to `Clsn2` under `ProjTypeCollision`, and
  applies `p2clsnrequire` before overlap.
- IKEMEN GO's projectile trade path uses projectile `Clsn2` boxes, while the
  existing port still compares projectile `Clsn1`/fallback hitboxes.

## Bounded implementation

- Add a typed collision-box selector shared by compiled HitDef/Projectile
  operations and runtime moves/projectiles.
- Preserve the regular default target selector as `Clsn2`; parse explicit
  `p2clsncheck` and `p2clsnrequire` values case-insensitively.
- Resolve direct and projectile target contact against `Clsn1`, `Clsn2`,
  `Size`, or `None`, with missing required boxes failing closed.
- Keep `ProjTypeCollision` authoritative: projectile trades and player/projectile
  contact use the current-frame projectile/player `Clsn2` pair.
- Make projectile-vs-projectile trade checks use strict current-frame `Clsn2`
  boxes, including same-owner projectiles only when their team-side contract
  permits interaction.

## Allowed claims

- Typed parser/runtime support for the four selector values and the required-box
  precondition on the covered direct/projectile routes.
- Strict `Clsn2` projectile trade admission under the bounded runtime world.

## Blocked claims

- Full MUGEN/IKEMEN projectile parity, proxy flattening, `affectteam`, depth
  ordering, cancel tick ordering, score, rollback/netplay, renderer/audio
  parity, and complete Studio/editor integration.

## Verification target

- Focused compiler, HitDef, ProjectileSystem, ProjectileCombatSystem, and
  RuntimeCombatResolutionSystem tests.
- TypeScript 7, build, boundaries, and trace QA at the next batch checkpoint.

## Result

Implemented in `3838fa5e`, with the fixture alignment follow-up in `845b8de5`.
The compiler/runtime now carries both selectors through HitDef and Projectile,
direct/root admission resolves `Clsn1`/`Clsn2`/`Size`/`None`, required boxes fail
closed, `ProjTypeCollision` keeps its `Clsn2` override, and projectile trades use
strict current-frame `Clsn2` boxes. Focused coverage is `168/168`; the full
checkpoint is `2262/2263` with one pre-existing self-projectile expectation
failure in `RuntimeMatchPostFighterSystem.test.ts`.

Allowed claim: bounded selector, requirement, and strict trade geometry contract.
Blocked claim: exact proxy/depth/affectteam/cancel-order parity, rollback/netplay,
score, renderer/audio parity, and complete MUGEN/IKEMEN parity.
