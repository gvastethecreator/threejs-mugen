# Issue 189 — Projectile chain admission before ReversalDef

- Status: `closed-bounded`
- Lane: `R2 Projectile combat semantics`
- Priority: `P1`

## Objective

Run Projectile ChainID and NoChainID admission before a defender's
ReversalDef callback can consume the Projectile.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` runs ChainID and NoChainID inside
`Char.attrCheck` before ReversalDef-vs-HitDef arbitration in
`Char.hittableByChar`. The projectile path uses the same HitDef admission.

Source symbols:

- `src/char.go`: `Char.attrCheck`
- `src/char.go`: `Char.hittableByChar`
- `src/char.go`: `CharList.collisionDetection`

## Port ledger

| Item | Decision |
| --- | --- |
| Projectile ChainID | reject after proven collision, before reversal callback |
| Projectile NoChainID | resolve source identity and profile before reversal callback |
| Accepted chain | preserve current reversal callback and result |
| Rejected chain | preserve Projectile counters and actor state |

## Acceptance fixture

- Prove invalid Projectile ChainID does not call ReversalDef.
- Prove active same-source Projectile NoChainID does not call ReversalDef.
- Prove matching ChainID still reaches ReversalDef.
- Prove rejected paths keep life, hit pause, targets, hit/removal state, and
  reversal state unchanged.

## Closure evidence

- Projectile and direct-integration focused coverage passes 153/153.
- Full Vitest passes 3456/3514 with the same 58 inherited
  character-package failures.
- Typecheck, 360-module build, 689/689 traces, boundaries,
  redirected-dispatch boundary, and diff hygiene pass.

## Claim ceiling

Do not claim Projectile priority parity, ReversalDef-vs-ReversalDef,
cross-frame collision scheduling, exact `targetedBy` lifetime, or full
Projectile parity.
