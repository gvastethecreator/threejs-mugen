# Issue 217 — HitDef dynamic hit priority

- Status: `closed-bounded`
- Lane: `R1 contact arbitration precision`
- Priority: `P1`

## Objective

Resolve the integer component of direct HitDef `priority` in root and Helper
caller contexts while retaining the static `Hit` / `Miss` / `Dodge` class.
Support root or redirected `ModifyHitDef` replacement before direct priority
clash arbitration.

## Source gate

M.U.G.E.N 1.1 documents `priority = hit_prior, hit_type` with default `4, Hit`.
Pinned Ikemen GO compiles the first component as a caller-context integer,
stores the static class, and evaluates the value on HitDef activation or live
mutation.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:38-46`
- pinned Ikemen `compiler_functions.go:1840-1860`
- pinned Ikemen `bytecode.go:7629-7635`
- local direct clash consumer `DirectCombatSystem.resolvePriorityClash`

## Acceptance fixture

- Compile finite dynamic priority with each supported static class and reject
  malformed values/classes.
- Resolve root and Helper caller expressions.
- Replace the live value/class through root or redirected `ModifyHitDef`.
- Add one required imported trace where the dynamic value decides a real
  direct priority clash.

## Claim ceiling

Do not claim Projectile or ModifyProjectile changes, dynamic priority class,
ReversalDef or ModifyReversalDef dynamic values, exact equal-priority trade
timing, negative/overflow parity, Helper-owned `ModifyHitDef`, teams, rollback,
or full arbitration parity.

## Closure evidence

- Root, Helper, and root/redirected `ModifyHitDef` resolve the integer priority
  in caller context while retaining the static Hit/Miss/Dodge class.
- Existing direct clash arbitration consumes the resolved value.
- Focused coverage: 197 tests.
- Required trace: `synthetic-imported-hitdef-dynamic-priority`, checksum
  `ab581cb1`, final checksum `5c8d1d55`.
- Aggregate gates: typecheck, 363-module build, boundaries, redirect boundary,
  and 715/715 traces pass. Full suite: 3560/3618 with the same 58 inherited
  missing-roster failures.
