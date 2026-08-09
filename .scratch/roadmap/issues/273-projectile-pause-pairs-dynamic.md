# T699 — Projectile `pausetime` / `guard.pausetime` dynamic pairs

Status: closed-bounded

## Contract

Fresh root- and Helper-authored Projectiles now retain typed one- or two-value
`pausetime` and `guard.pausetime` pairs. Each finite component resolves once in
the original caller context and is stored in the fresh Projectile payload. A
missing guard component inherits the corresponding normal pause component, as
in the pinned Ikemen finalization path. Accepted hit and guard contacts expose
the defender shake component through `GetHitVar(hitshaketime)` and preserve
root/Helper/parent ownership and Projectile lifecycle evidence.

The first component is Projectile-local hit pause (`hitPauseRemaining`); it is
not an owner-player `HitPause` claim. The second component is the defender
shake duration read back through `GetHitVar(hitshaketime)`.

## Source mapping

- M.U.G.E.N 1.1: `sctrls.html:1521-1530` documents `pausetime` and the
  optional `guard.pausetime` pair.
- Ikemen GO pin `149402f`: `compiler_functions.go:2041-2047` compiles up to two
  integer expressions; `bytecode.go:7777-7785` evaluates supplied components;
  `char.go:731,875-876` finalizes missing guard components from normal pause;
  contact paths at `char.go:10939-10941,10976,10997` consume the pair and
  publish hit-shake metadata.

## Evidence

- Aggregate QA: `779/779` artifacts, `745` required, `34` optional, zero
  failures.
- Root trace: `synthetic-imported-projectile-dynamic-pausetime`, with dynamic
  pair `4,7`, Projectile payload `hitPause=4`, `guardPause=3`, accepted hit,
  lifecycle, target link, and `GetHitVar(hitshaketime)=7` branch evidence.
- Helper trace: `synthetic-imported-helper-projectile-dynamic-pausetime`, with
  dynamic normal pair `3,5`, guard pair `4,9`, accepted guard, Helper/root/
  parent ownership, lifecycle, target links, and `GetHitVar(hitshaketime)=9`.
- Focused compiler/runtime/trace tests pass; full Vitest passes `3812/3812`
  across `328` files with a single worker; typecheck and the `363`-module
  production build pass.

## Boundaries

Live `ModifyProjectile` pause mutation, exact stacking/preemption and tick
ordering, owner-player pause parity, negative/overflow values, nested helper
and team topology, rollback, and full Projectile timing parity remain
unclaimed. MUGEN/Ikemen controller grammar and all pause semantics beyond the
typed fresh-spawn/contact seam remain outside this bounded claim.
