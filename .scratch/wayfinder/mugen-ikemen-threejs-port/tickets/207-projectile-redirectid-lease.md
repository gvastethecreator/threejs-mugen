# Implement Projectile RedirectID lease/v1

Type: task
Status: selected
Blocked by: None

## Question

Can root active CNS `Projectile` controllers use the existing RedirectID lease
to create a projectile in the destination root's effect store with
destination-owned runtime identity?

## Source boundary

IKEMEN documents `RedirectID` as a general state-controller feature and warns
that processing order can limit individual controllers. There is no dedicated
public `Projectile RedirectID` ordering contract in the current controller
references, so this ticket is a bounded store/identity adapter, not a claim of
exact engine parity.

## Scope

- lower and validate `Projectile` `redirectid`;
- resolve the destination root through the existing active-CNS lease;
- create the projectile in the destination root's effect store;
- assign destination root ownership for `ownerId`, `rootId`, and `parentId`;
- use the destination actor's existing spawn position/definition path;
- keep omitted RedirectID local and fail closed for invalid or unavailable
  destinations;
- preserve existing sound and telemetry plumbing.

Do not widen State -1/global-state ordering, helper-owned projectiles,
`OwnProjectile`, `ModifyProjectile` beyond its closed ticket, recursive
redirects, `ProjTypeCollision`, score, rollback/netplay, renderer behavior, or
full projectile parity.

## Evidence required

- compiler coverage for valid and malformed `Projectile RedirectID`;
- runtime proof of destination store and ownership identity;
- local and invalid paths remain bounded;
- TypeScript 7 check, focused effect/runtime batch, and diff hygiene;
- closeout report with source uncertainty and score impact.

## Research basis

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
- `docs/research/2026-07-16-projectile-redirectid.md`
- `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Exit

Root active CNS `Projectile RedirectID` creates destination-owned projectiles
through the synchronous lease with focused evidence. Unsupported ordering and
ownership surfaces remain explicit and fail closed.
