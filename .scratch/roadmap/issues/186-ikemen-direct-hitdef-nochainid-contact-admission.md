# Issue 186 — Ikemen direct HitDef NoChainID contact admission

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Carry direct HitDef `nochainid` lists through static and bounded dynamic
root/helper HitDef plus root RedirectID ModifyHitDef routes. Reject matching
repeat contact only for the same source player while hitshake is active or the
same source actor is still the latest proven targeter.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles up to eight integer
`nochainid` values and lets ModifyHitDef replace them. `Char.attrCheck` tests
the list after ChainID admission. Rejection also needs the previous HitDef
player ID to match and either active hitshake or the current getter as the last
`targetedBy` actor.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub`
- `src/bytecode.go`: `hitDef_nochainid`
- `src/char.go`: `Char.attrCheck` NoChainID check

## Port ledger

| Item | Decision |
| --- | --- |
| Static direct HitDef list | adapt to a typed list capped at eight integers |
| Dynamic root/helper HitDef list | adapt selected integer expressions |
| Dynamic root RedirectID ModifyHitDef list | adapt selected integer expressions |
| Same-player ownership | use stored `sourcePlayerId` |
| Hitshake window | use current defender hit pause |
| Latest targeter | use stored last source actor |
| Cross-player previous hit | ignore the exclusion |

## Acceptance fixture

- Prove matching same-player entries reject without damage or target memory.
- Prove omitted, negative, non-matching, and cross-player entries accept.
- Prove the same last source actor still rejects outside hitshake.
- Prove static and dynamic root/helper HitDef plus root RedirectID
  ModifyHitDef values control
  admission.
- Prove one imported seed-hit and rejected-repeat runtime trace.

## Closure evidence

- Focused compiler, HitDef, Helper, direct-combat, Playable redirect, and trace
  commands pass 224/224.
- Full Vitest passes 3449/3507 with the same 58 inherited
  character-package failures.
- Typecheck, 359-module build, 688/688 traces (654 required / 34 optional),
  boundaries, redirected-dispatch boundary, and diff hygiene pass.
- Required trace `synthetic-imported-direct-hitdef-nochainid` proves a real
  seed HitDef id 43 followed by a rejected id 77 repeat with life unchanged.

## Claim ceiling

Do not claim Projectile NoChainID, exact Ikemen `targetedBy` lifetime/order,
team/tag ownership, ChainID/NoChainID equality behavior, product Helper
ModifyHitDef, more than eight entries, or full HitDef parity.
