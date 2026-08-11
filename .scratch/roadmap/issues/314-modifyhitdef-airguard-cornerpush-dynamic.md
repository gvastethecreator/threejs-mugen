# Issue 314 — Live `ModifyHitDef airguard.cornerpush.veloff`

Status: **closed-bounded** (T740, 2026-08-11)

## Objective

Close the next uncovered live HitDef mutation seam: caller-context dynamic
`airguard.cornerpush.veloff` for root/RedirectID `ModifyHitDef`, with the
active value preserved when the controller omits the parameter.

## Official basis

Pinned Ikemen-GO `149402f` treats `airguard.cornerpush.veloff` as a float
parameter on the live HitDef mutation path. The expression is evaluated in
the original caller context and the resulting value controls the accepted
airborne-guard corner-push offset. M.U.G.E.N 1.1 documents the surrounding
air-guard/corner-push behavior, but not `ModifyHitDef`; this is therefore an
Ikemen-only live-mutation claim.

## Bounded scope

- static and caller-context dynamic finite values on root/RedirectID
  `ModifyHitDef`;
- Helper dispatch resolution of the same operation for unit/runtime coverage;
- omission or unresolved values preserve the active live value;
- accepted airborne-guard trace proving caller `var(2)=6`, target link and
  the resulting attacker displacement.

## Excluded

Fresh/direct defaults, Helper-owned causal trace, Projectile/ModifyProjectile,
dynamic Z or other corner-push components, reversal/override branches, exact
tick/physics parity, localcoord/facing edge cases, teams, rollback, and full
M.U.G.E.N/Ikemen parity remain out of scope.

## Closure evidence

- Compiler, HitDef runtime and Helper tests cover static, dynamic and malformed
  input plus omission preservation.
- Required trace is
  `synthetic-imported-modifyhitdef-dynamic-airguard-cornerpush.json` and proves
  `VarSet -> HitDef -> ModifyHitDef -> airborne guard`, target `78`, caller
  `var(2)=6`, and the resulting corner-push displacement.
- Focused compiler/runtime/Helper/trace tests and typecheck pass; the aggregate
  `pnpm qa:trace` result is recorded in the closure docs after the final gate.

The next boundary is selected only after T740's global gate; the superseded
T739 / issue 313 must not be reactivated.
