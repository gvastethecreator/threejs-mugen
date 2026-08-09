# Issue 222 — Dynamic direct HitDef id and chainid

- Status: `closed-bounded`
- Lane: `R1 direct contact admission`
- Priority: `P1`

## Objective

Resolve direct HitDef `id` and `chainid` in root and Helper caller contexts,
preserve or replace them through root or redirected `ModifyHitDef`, and feed
the existing target memory, GetHitVar metadata, and ChainID admission path.

## Source gate

M.U.G.E.N 1.1 defines `id` as the HitDef target ID and `chainID` as the
previous accepted HitDef ID required for contact. Pinned Ikemen GO evaluates
both in caller context, clamps `id` to zero or greater, retains signed
`chainid`, reuses the evaluator for `ModifyHitDef`, and applies chain admission
before accepted contact and target memory.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1011-1016`
- pinned Ikemen `compiler_functions.go:1766-1775`
- pinned Ikemen `bytecode.go:7578-7584`, `8338-8351`
- pinned Ikemen `char.go:763-764`, `10499-10513`, `10884-10891`, `10953-10959`

## Acceptance fixture

- Compile static and dynamic direct values and reject malformed expressions.
- Resolve root and Helper caller expressions; clamp negative IDs to zero;
  preserve omitted live fields and replace supplied root or redirected
  `ModifyHitDef` values, including `chainid = -1`.
- Prove a prior accepted ID enables a matching chain and rejects a mismatch.
- Preserve target links and `GetHitVar(hitid/chainid)` metadata.
- Add one required imported trace with VarSet-derived IDs and two accepted
  chained contacts.

## Claim ceiling

Do not claim Projectile/ModifyProjectile, ReversalDef, new NoChainID behavior,
cross-player or team chain topology, exact M.U.G.E.N timing for every chain
edge, rollback, or full contact-admission parity.

## Closure evidence

- Focused compiler, HitDef, root/Helper combat, redirected ModifyHitDef,
  Playable runtime, and imported-trace coverage passes 281 tests.
- Typecheck, the 363-module production build, runtime boundaries, and
  redirected-dispatch boundaries pass.
- Required trace `synthetic-imported-hitdef-dynamic-id-chainid` passes with
  checksum `dd7aeeed`; aggregate trace QA passes 720/720 (686 required).
- The full suite passes 3586/3644; the remaining 58 failures are the inherited
  missing/stale legacy-roster expectations outside this runtime slice.
