# Issue 315 — Live `ModifyHitDef` corner-push offsets

Status: closed-bounded (T741, 2026-08-11)

## Scope

Close the remaining live `ModifyHitDef` corner-push offset fields for the
root/RedirectID path and Helper caller evaluation:

- `ground.cornerpush.veloff`
- `air.cornerpush.veloff`
- `down.cornerpush.veloff`
- `guard.cornerpush.veloff`

`airguard.cornerpush.veloff` was already closed by T740 / issue 314. Static
and caller-context dynamic finite values are retained in typed IR. A fresh
live mutation changes only authored fields; omission or an unresolved dynamic
expression preserves the active component.

## Source authority

- Ikemen GO pin `149402f`: `compiler_functions.go` compiles all five
  corner-push offsets as float HitDef parameters; `bytecode.go` evaluates
  `ModifyHitDef` through the active HitDef subroutine; `char.go` carries the
  finalized values into hit/guard combat resolution.
- M.U.G.E.N 1.1 `sctrls.html` documents the five HitDef corner-push fields.
  The live `ModifyHitDef` mutation is explicitly an Ikemen compatibility
  claim, not a M.U.G.E.N 1.1 controller claim.

## Evidence

Required trace:

- `synthetic-imported-modifyhitdef-dynamic-ground-cornerpush.json`
- trace checksum `27dae2dd`
- final checksum `a571323c`
- `VarSet -> HitDef -> ModifyHitDef -> grounded guard`, target `81`
- accepted guard keeps the grounded route and exposes attacker displacement

Aggregate gate: `pnpm qa:trace` passed `827/827` artifacts (`793` required,
`34` optional). Focused compiler/runtime/Helper tests and `pnpm typecheck`
pass.

## Explicit exclusions

Fresh/direct default derivation, airborne/down physical timing, Helper-owned
causal trace, Projectile/ModifyProjectile mutation, dynamic Z or `n` syntax,
corner-push decay/wall friction, exact localcoord/facing/tick parity, teams,
rollback, and full M.U.G.E.N/Ikemen combat parity remain outside this bounded
claim.
