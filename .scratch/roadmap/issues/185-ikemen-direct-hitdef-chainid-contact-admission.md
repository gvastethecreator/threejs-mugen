# Issue 185 — Ikemen direct HitDef ChainID contact admission

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Enforce direct HitDef `chainid` before normal and equal-priority contact is
consumed. A non-negative current move chain ID may hit only when the defender's
previous `GetHitVar(id)` matches it.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` checks `ghd.chainid >= 0` against
the target's previous `gethit.hitid` in `Char.attrCheck` before the HitDef is
accepted.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub`
- `src/bytecode.go`: `hitDef_chainid`
- `src/char.go`: `Char.attrCheck` ChainID check

## Port ledger

| Item | Decision |
| --- | --- |
| Existing typed HitDef/ModifyHitDef chain ID | retain |
| Normal direct admission | enforce before target/contact consumption |
| Equal-priority prepared contact | enforce before trade preparation |
| Omitted or negative value | unrestricted |
| Rejected-contact observability | adapt to direct combat logs/trace |

## Acceptance fixture

- Prove matching previous hit ID accepts direct contact.
- Prove missing or mismatched IDs reject without damage or target memory.
- Prove omitted and negative values remain unrestricted.
- Prove equal-priority trade preparation respects the same admission rule.
- Prove the imported CNS route with a real seed hit and chained direct HitDef.

## Claim ceiling

Do not claim Projectile chains, NoChainID, exact override/reversal ordering,
dynamic ModifyHitDef breadth, cross-player NoChainID ownership, or full HitDef
priority parity.

## Closure evidence

- Normal direct HitDef admission accepts matching previous IDs and rejects
  missing or mismatched IDs before damage, target memory, or contact use.
- Omitted and negative ChainID values remain unrestricted.
- Equal-priority bilateral preparation applies the same admission rule before
  either direction is committed.
- The normal get-hit and owner-backed custom-state imported fixtures now use a
  real seed HitDef id 43 before the chained HitDef.
- Focused tests: `7/7`.
- Full suite: `3443/3501`; the same 58 character-package failures are inherited.
- `pnpm typecheck`, `pnpm build` (359 modules), `pnpm qa:trace` (`687/687`),
  boundaries, redirect-boundary, and `git diff --check` pass.
