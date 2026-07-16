# Projectile RedirectID research

Date: 2026-07-16
Wayfinder ticket: 207

## Primary sources

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  says `RedirectID` is available to legacy and new state controllers, while
  warning that controller processing order can limit support.
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  documents the surrounding Projectile parameter and ownership surface, but
  does not publish a dedicated `Projectile RedirectID` processing contract.
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  remains the MUGEN baseline for Projectile creation; the redirect behavior is
  explicitly IKEMEN-scoped.

## Repository evidence

- `RuntimeEffectSpawnWorld.spawnProjectile` already derives projectile
  `ownerId`, `rootId`, `parentId`, sprite definition, action, position, and
  local coordinate scale from the actor passed to the world.
- `RuntimeEffectActorWorld.spawnProjectile` stores the projectile by owner id,
  so passing a lease-resolved root gives one stable destination ownership
  boundary without a second spawn API.
- The active root dispatcher already resolves `Projectile` as an effect spawn
  and carries caller expression context for sound/other resolvers.
- Helper and root effect stores are currently coupled at the root boundary;
  helper-specific `OwnProjectile` semantics need a separate ownership model.

## Decision

Implement only root active CNS `Projectile RedirectID` by reusing the existing
lease. The destination actor is passed to the existing spawn world, so the new
projectile is stored under the destination root and receives destination-owned
`ownerId`, `rootId`, `parentId`, sprite definition, position basis, and combat
ownership. Omitted RedirectID remains local. Invalid, stale, unavailable, or
non-IKEMEN destinations are blocked.

This is a compatibility adapter based on the public general RedirectID rule
and the local effect-store contract. It does not infer exact upstream
processing order, caller-vs-destination evaluation for every undocumented
Projectile parameter, or helper ownership from the source references.

## Acceptance boundary

Allowed: typed `Projectile redirectid`, root active CNS destination-store
creation, destination ownership identity, local fallback, fail-closed lease
behavior, and focused telemetry.

Blocked: State -1/global-state, helper/`OwnProjectile`, recursive redirects,
exact upstream ordering, `ModifyProjectile` follow-up semantics, `ProjTypeCollision`,
score, rollback/netplay, renderer presentation, and full parity.
