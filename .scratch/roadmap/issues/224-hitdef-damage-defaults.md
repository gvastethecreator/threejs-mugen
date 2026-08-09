# Issue 224 — Fresh direct HitDef damage defaults

- Status: `closed-bounded`
- Lane: `R1 direct damage policy`
- Priority: `P1`

## Objective

Reset fresh direct HitDef damage to the official zero defaults when `damage`
is omitted, prevent inheritance from the prior active move, and preserve the
already verified live `ModifyHitDef` component semantics.

## Source gate

M.U.G.E.N 1.1 defines omitted damage as hit and guard damage zero. Pinned
Ikemen GO reconstructs a fresh HitDef with zero-valued damage fields, writes
the first supplied component, writes the second only when present, and reuses
the component-wise evaluator without a reset for `ModifyHitDef`.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1517-1520`
- pinned Ikemen `compiler_functions.go:1806-1808`
- pinned Ikemen `char.go:685-824`
- pinned Ikemen `bytecode.go:7601-7605`, `8332-8351`

## Acceptance fixture

- Seed an adversarial current move with nonzero hit/guard damage.
- Prove fresh omission resets to 0/0, one component becomes hit/0, and two
  components replace both values.
- Prove ModifyHitDef omission preserves both values, one component preserves
  guard, and two components replace both.
- Prove zero-damage accepted contact preserves life and exposes zero through
  `GetHitVar(damage/hitdamage/guarddamage)` while retaining target memory.
- Prove omitted fresh get/givepower defaults derive as zero.
- Add one required imported trace with omitted damage and Common1 zero-value
  GetHitVar branch evidence.

## Claim ceiling

Do not claim Projectile/ModifyProjectile, ReversalDef, exact negative/healing
behavior, other HitDef defaults, global multiplier rounding, teams, rollback,
or full damage parity.

## Closure evidence

- Focused HitDef, root/Helper contact, redirected ModifyHitDef, Playable
  runtime, and imported-trace coverage passes 130 tests.
- Typecheck, the 363-module production build, runtime boundaries, and
  redirected-dispatch boundaries pass.
- Required trace `synthetic-imported-hitdef-omitted-damage` passes with
  checksum `72489df2`; aggregate trace QA passes 722/722 (688 required).
- The full suite passes 3595/3653; the remaining 58 failures are the inherited
  missing/stale legacy-roster expectations outside this runtime slice.
