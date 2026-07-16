# Wayfinder 210: HitDef and Projectile AffectTeam

Status: selected

## Goal

Implement the bounded IKEMEN `affectteam` and `teamside` admission policy in the typed direct/root/projectile combat paths. Keep the existing PlayerPush `AffectTeam` contract separate from attack-team filtering.

## Official contract

- IKEMEN `HitDef` stores `affectteam` as `-1F`, `0B`, `1E` and defaults it to `1` (enemies).
- `teamside` is the effective side of the attack. When omitted, the attack inherits the actor side.
- Direct HitDef admission rejects a target when the attack policy does not allow the target side.
- Projectile-vs-player admission applies the projectile policy; projectile-vs-projectile clashes require both projectile policies to allow the other projectile.
- `HitFlag = P` cancellation uses the defending HitDef policy against the incoming projectile.

Primary sources:

- https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/compiler_functions.go
- https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29

## Scope

1. Add typed compiler/runtime fields for `affectteam` and HitDef `teamside`.
2. Apply the policy in direct pair/root admission, priority contact, projectile cancellation, projectile-vs-player contact, and projectile clashes.
3. Add focused fixtures for enemies, friends, both, explicit projectile team side, and same-owner projectile behavior.
4. Record evidence before closeout; keep proxies, Helpers, neutral identities, and full parity as explicit residuals unless the existing path already proves them.

## Evidence gate

- Focused compiler/runtime tests pass.
- TypeScript 7, build, boundaries, and trace gate pass at the next broad checkpoint.
- Any unrelated full-suite failures remain named and unclaimed.
