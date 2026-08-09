# Issue 223 — Dynamic direct HitDef damage pair

- Status: `closed-bounded`
- Lane: `R1 direct damage policy`
- Priority: `P1`

## Objective

Resolve explicit direct HitDef `damage = hit, guard` expressions in root and
Helper caller contexts, preserve or replace the active pair through root or
redirected `ModifyHitDef`, and feed the existing hit/guard life, GetHitVar,
and fresh default-power derivation paths.

## Source gate

M.U.G.E.N 1.1 defines one or two integer damage expressions. Pinned Ikemen GO
evaluates them in caller context, writes the hit component, writes the guard
component only when supplied, and reuses that behavior for `ModifyHitDef`.
Fresh one-component creation derives the omitted guard component as zero in
this bounded explicit-value slice; live one-component mutation preserves the
active guard value.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:905-906`
- pinned Ikemen `compiler_functions.go:1806-1808`
- pinned Ikemen `bytecode.go:7601-7605`, `8338-8351`
- pinned Ikemen `char.go:11231-11250`, `11262-11266`

## Acceptance fixture

- Compile literal and dynamic one/two-component values and reject malformed
  expressions.
- Resolve root and Helper caller expressions with integer truncation.
- Prove fresh single-value guard zero, fresh pair replacement, live
  single-value guard preservation, and live pair replacement through root or
  redirected `ModifyHitDef`.
- Prove accepted hit/guard life and `GetHitVar(damage/hitdamage/guarddamage)`.
- Prove fresh omitted get/givepower defaults derive from the resolved dynamic
  hit damage without recomputing them during ModifyHitDef.
- Add one required imported trace with VarSet-derived 41/7 damage and Common1
  GetHitVar branch evidence.

## Claim ceiling

Do not claim the entirely omitted damage default, exact negative/healing
behavior, Projectile/ModifyProjectile, global multiplier rounding parity,
teams, rollback, or full damage parity.

## Closure evidence

- Focused compiler, HitDef, Helper combat, redirected ModifyHitDef, Playable
  runtime, and imported-trace coverage passes 225 tests.
- Typecheck and focused differential checks pass.
- Required trace `synthetic-imported-hitdef-dynamic-damage` passes with
  checksum `a42d3700` and final P2 life 959.
- Aggregate trace output reports 721/721 green (687 required), but the wrapper
  exceeded its 300-second limit after writing the passing report and artifact;
  the aggregate command is therefore recorded as inconclusive, not passed.
- The following T650 aggregate run completed normally at 722/722 and includes
  this T649 required artifact.
