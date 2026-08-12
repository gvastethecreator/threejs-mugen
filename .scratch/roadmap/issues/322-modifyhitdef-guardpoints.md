# Issue 322 — Live `ModifyHitDef guardpoints`

Status: closed-bounded (T748, 2026-08-12)

## Scope

Carry live Ikemen `ModifyHitDef guardpoints` through typed controller IR and
runtime. Root/RedirectID and Helper callers evaluate static and caller-context
dynamic values against the active HitDef. Omission preserves the live payload;
fresh direct HitDef guardpoints and pool/resource defaults stay separate.

## Evidence

- Product: `dd2309df` (`feat(mugen): support live ModifyHitDef guardpoints`).
- Focused coverage: RuntimeCompiler, HitDefSystem and HelperSystem tests pass,
  including static, dynamic caller resolution and omission preservation.
- Durable trace: `synthetic-imported-modifyhitdef-dynamic-guard-points-golden`
  proves `VarSet -> HitDef -> ModifyHitDef -> guard`, RedirectID target `78`,
  caller `var(0)=19`, `GetHitVar(guardpoints)=19`, and the guarded branch.
- Evidence: `d1cf7962` (`test(evidence): gate live ModifyHitDef guardpoints`).
- Aggregate status: the required artifact passes independently. The aggregate
  `pnpm qa:trace` still has the pre-existing
  `synthetic-imported-helper-bind-to-target-redirect` missing-target-link gate;
  this is separate from T748.

## Source contract

Pinned Ikemen source compiles `guardpoints` as an integer HitDef parameter and
reuses the live `HitDef` subroutine for `ModifyHitDef`, evaluating the caller
expression before writing the active payload. M.U.G.E.N 1.1 documents fresh
HitDef guardpoints, not an official live `ModifyHitDef` controller; this live
mutation claim is therefore Ikemen-only.

## Explicit limits

Exact guard-points pool decrement/clamp/resource timing, fresh default
derivation, Projectile/ModifyProjectile, ReversalDef, negative/overflow
behavior, teams, rollback and full M.U.G.E.N/Ikemen combat parity remain open.
