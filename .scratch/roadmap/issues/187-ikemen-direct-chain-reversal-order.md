# Issue 187 — Ikemen direct chain admission before ReversalDef

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Run direct root/helper HitDef ChainID and NoChainID admission before a
defender's ReversalDef can consume the incoming attack.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` runs ChainID and NoChainID inside
`Char.attrCheck` before its ReversalDef-vs-HitDef attribute branch.
`Char.hittableByChar` then performs ReversalDef and priority arbitration.

Source symbols:

- `src/char.go`: `Char.attrCheck`
- `src/char.go`: `Char.hittableByChar`
- `src/char.go`: `CharList.collisionDetection`

## Port ledger

| Item | Decision |
| --- | --- |
| Root incoming ChainID | reject before `RuntimeReversalWorld.findActive` |
| Root incoming NoChainID | reject before `RuntimeReversalWorld.findActive` |
| Helper incoming ChainID | use the same ordering |
| Helper incoming NoChainID | use the same ordering |
| Accepted incoming chain | preserve existing ReversalDef handling |

## Acceptance fixture

- Prove rejected root ChainID does not consume ReversalDef.
- Prove rejected root NoChainID does not consume ReversalDef.
- Prove rejected Helper ChainID and NoChainID do not consume ReversalDef.
- Prove matching ChainID still permits the existing reversal result.
- Prove actors, target memory, hit pause, and state remain unchanged on reject.

## Closure evidence

- Root and Helper focused coverage passes 68/68.
- Full Vitest passes 3451/3509 with the same 58 inherited
  character-package failures.
- Typecheck, 359-module build, 688/688 traces, boundaries, redirected-dispatch
  boundary, and diff hygiene pass.

## Claim ceiling

Do not claim Projectile ordering, ReversalDef-vs-ReversalDef arbitration,
exact priority/HitOverride ordering, chain equality quirks, or full collision
scheduling parity.
