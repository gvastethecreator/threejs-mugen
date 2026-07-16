# ModifyProjectile RedirectID research

Date: 2026-07-16
Wayfinder ticket: 206

## Primary sources

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  describes `RedirectID` as an optional parameter available to all state
  controllers, and warns that processing order can prevent some controllers
  from working with it.
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  lists the changed `Projectile` parameter surface and the newer projectile
  ownership interactions. It does not provide a dedicated `ModifyProjectile`
  RedirectID execution contract, so this slice must remain an adapter rather
  than a claim of exact upstream ordering.
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  remains the MUGEN baseline for projectile creation and mutation; the
  RedirectID route is explicitly IKEMEN-scoped.

## Repository evidence

- `ModifyProjectileControllerOp` already carries static values and the
  runtime already resolves dynamic bounds, selection, and mutation values in
  the caller's expression context.
- `RuntimeEffectSpawnWorld.modifyProjectiles` accepts an actor and delegates
  to the actor's effect store, so a root destination can be selected without
  inventing a second projectile mutation API.
- The root RedirectID lease already guarantees exact live destination identity,
  frozen candidate projection, destination state ownership, and synchronous
  freshness checks.
- Root and helper effects currently share root stores. Redirecting a root
  `ModifyProjectile` to another root is therefore a stable, observable
  boundary; helper ownership and `OwnProjectile` need a different contract.

## Decision

Implement only root active CNS `ModifyProjectile RedirectID` in the existing
lease. The redirect expression is compiled and validated, the destination is
resolved before dispatch, and the existing `ModifyProjectile` resolver keeps
using the caller runtime. The dispatch actor changes to the destination only
for store ownership; it does not change the caller expression context.

Omitted RedirectID continues to mutate the caller's store. Invalid, missing,
stale, unavailable, or non-IKEMEN redirects are blocked without mutation.
State -1/global-state execution, `Projectile` spawn RedirectID, helper
projectile ownership, exact engine processing order, `OwnProjectile`,
`ProjTypeCollision`, score, rollback/netplay, and renderer behavior remain
open.

## Acceptance boundary

Allowed: typed `ModifyProjectile redirectid`, root active CNS destination-store
mutation, caller-context dynamic values, local fallback, fail-closed lease
behavior, and focused telemetry.

Blocked: `Projectile` creation RedirectID, State -1/global-state, helper
destination stores, recursive redirects, exact upstream order, score,
rollback/netplay, renderer presentation, and full MUGEN/IKEMEN parity.
