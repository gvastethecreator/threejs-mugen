# Wayfinder 210: HitDef and Projectile AffectTeam

Status: completed

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

## Result

Implemented in `8de2bb3a`, with projectile owner identity hardening in
`9b3f434b` and the post-fighter bridge fixture alignment in `80e69138`.
The typed compiler/runtime now carries `affectteam` and HitDef `teamside`
through imported/static and active moves, applies the policy to direct/root
admission and priority contact, filters projectile player contact and
projectile clashes, and keeps defending `HitFlag = P` policy separate from the
incoming projectile policy. PlayerPush remains its own contract.

Focused coverage is `165/165`; the full suite is `216/216` files and
`2273/2273` tests. TypeScript 7, build, boundaries, and `qa:trace` all pass;
trace coverage is `633/633` with no skipped fixtures.

Allowed claim: bounded typed AffectTeam/TeamSide filtering for known `p1`-`p8`
team identities, explicit projectile sides, root/direct priority contact,
projectile player contact, HitFlag P cancellation, and projectile clashes.

Blocked claim: exact proxy/helper identity beyond the existing owner/root
mapping, neutral/platform actor policy, every legacy owner exception, depth
ordering, rollback/netplay, score, renderer/audio parity, and full
MUGEN/IKEMEN parity.
