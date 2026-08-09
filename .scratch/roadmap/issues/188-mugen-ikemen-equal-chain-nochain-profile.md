# Issue 188 — MUGEN/Ikemen equal ChainID and NoChainID profile split

- Status: `closed-bounded`
- Lane: `R2 direct and Projectile combat semantics`
- Priority: `P1`

## Objective

Split the case where a matching ChainID is also present in NoChainID by runtime
profile for root, Helper, and Projectile contact.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` documents the engine difference in
`Char.attrCheck`: MUGEN lets equal ChainID and NoChainID hit, while current
Ikemen GO still applies NoChainID rejection after ChainID passes.

Source symbols:

- `src/char.go`: `Char.attrCheck` ChainID and NoChainID checks
- `src/compiler_functions.go`: `hitDefSub`
- `src/bytecode.go`: `hitDef_chainid` and `hitDef_nochainid`

## Port ledger

| Item | Decision |
| --- | --- |
| MUGEN 1.1 root HitDef | matching ChainID overrides the equal NoChainID entry |
| MUGEN 1.1 Helper HitDef | use the same profile rule |
| MUGEN 1.1 Projectile | use the same profile rule |
| Ikemen GO | keep NoChainID rejection |
| Unknown profile | keep conservative NoChainID rejection |

## Acceptance fixture

- Prove root, Helper, and Projectile equal IDs hit under `mugen-1.1`.
- Prove the same contacts reject under `ikemen-go` and `unknown`.
- Prove NoChainID without the equal matching ChainID still rejects under MUGEN.
- Preserve current ownership, hitshake, and last-targeter checks.

## Closure evidence

- Root, Helper, Projectile, and trace-preset coverage passes 827/827.
- Full Vitest passes 3455/3513 with the same 58 inherited
  character-package failures.
- Typecheck, 360-module build, 689/689 traces (655 required / 34 optional),
  boundaries, redirected-dispatch boundary, and diff hygiene pass.
- Required Ikemen and MUGEN traces use real seed HitDef id 43. Ikemen rejects
  the equal pair; MUGEN records target id 77 and damage.

## Claim ceiling

Do not claim MUGEN 1.0/WinMUGEN variants, cross-player NoChainID changes,
Projectile ReversalDef ordering, exact `targetedBy` lifetime, or broader chain
parity.
