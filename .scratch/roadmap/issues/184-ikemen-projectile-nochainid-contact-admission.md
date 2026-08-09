# Issue 184 — Ikemen Projectile NoChainID contact admission

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Carry Projectile `nochainid` lists through static spawn and bounded dynamic
root/helper ModifyProjectile selection. Reject a repeated matching hit ID only
when it belongs to the same source player and the current runtime can prove
active hitshake or the same last targeting actor.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles up to eight integer
`nochainid` values, lets ModifyProjectile replace the selected live Projectile
HitDef entries, and checks the list after `chainid` admission. The rejection
also requires the previous HitDef player ID to match and either active hitshake
or the current getter as the last `targetedBy` actor.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub` / `projectileSub`
- `src/bytecode.go`: `hitDef_nochainid` and `modifyProjectile.Run`
- `src/char.go`: `Char.attrCheck` NoChainID check

## Port ledger

| Item | Decision |
| --- | --- |
| Static Projectile list | adapt to a typed list capped at eight integers |
| Dynamic ModifyProjectile list | adapt selected root/helper expressions |
| Same-player ownership | adapt to stored `sourcePlayerId` |
| Hitshake window | adapt to current defender hit pause |
| Last targeting actor | adapt to stored last HitDef source actor |
| Cross-player previous hit | ignore the exclusion |

## Acceptance fixture

- Prove a same-player matching list entry rejects repeat contact.
- Prove omitted, negative, non-matching, and cross-player entries accept.
- Prove contact outside hitshake still rejects for the same last source actor.
- Prove a selected static/dynamic ModifyProjectile change controls admission,
  including one root and one helper expression route.

## Claim ceiling

Do not claim exact Ikemen `targetedBy` lifetime/order, more than eight entries,
team/tag ownership, chainID/nochainID equality precedence, direct HitDef
NoChainID parity, or full HitDef chain parity.

## Closure evidence

- Static Projectile spawn retains the first eight integer `nochainid` values.
- Selected root/helper ModifyProjectile expressions replace the live list.
- Same-player matching IDs reject during hitshake or for the same last source
  actor without damage, target memory, or Projectile consumption.
- Omitted, negative, non-matching, cross-player, and expired unrelated-source
  cases remain unrestricted.
- Required trace `synthetic-imported-projectile-nochainid` proves a real seed
  hit followed by a rejected repeat Projectile.
- Focused tests: `230/230`.
- Full suite: `3441/3499`; the same 58 character-package failures are inherited.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (`687/687`), boundaries,
  redirect-boundary, and `git diff --check` pass.
