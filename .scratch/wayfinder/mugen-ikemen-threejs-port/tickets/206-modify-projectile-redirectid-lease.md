# Implement ModifyProjectile RedirectID lease/v1

Type: task
Status: selected
Blocked by: None

## Question

Can root active CNS `ModifyProjectile` controllers use the existing
RedirectID lease to mutate the destination root's projectile store while
keeping dynamic parameter evaluation in the caller context?

## Source boundary

IKEMEN documents `RedirectID` as an optional feature available to all state
controllers, while warning that processing order can make some controllers
unredirectable in practice. The repository already has a synchronous root
lease for destination identity and freshness, plus a typed `ModifyProjectile`
operation and caller-side dynamic numeric resolvers. This ticket tests the
smallest projectile RedirectID mutation surface that fits those contracts.

## Scope

- lower a validated `ModifyProjectile` `redirectid` expression into the typed
  controller operation;
- resolve the destination root through the existing lease during active CNS;
- mutate only the destination root's projectile store;
- evaluate dynamic `ModifyProjectile` values against the caller runtime;
- keep omitted RedirectID local and preserve the existing local path;
- fail closed for invalid, missing, stale, or unavailable destinations;
- record bounded redirected controller/operation telemetry without claiming
  projectile parity beyond the mutation itself.

Do not widen `Projectile` spawn RedirectID, State -1/global-state routing,
helper-owned projectiles, `OwnProjectile`, `ProjTypeCollision`, recursive
redirects, score, rollback/netplay, renderer behavior, or full parity.

## Evidence required

- compiler coverage for valid and invalid `ModifyProjectile` RedirectID;
- runtime coverage proving destination-store mutation and caller-context
  dynamic values;
- local, invalid, and non-IKEMEN behavior remains bounded;
- TypeScript 7 check, focused effect/runtime batch, and diff hygiene;
- closeout report with explicit score impact and remaining debt.

## Research basis

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
- `docs/research/2026-07-16-modify-projectile-redirectid.md`
- `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Exit

Root active CNS `ModifyProjectile RedirectID` has a typed, lease-backed,
caller-evaluated destination mutation path with focused evidence. Unsupported
projectile RedirectID surfaces remain visible and fail closed.
