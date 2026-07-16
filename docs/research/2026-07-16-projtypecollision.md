# ProjTypeCollision research

Date: 2026-07-16
Wayfinder ticket: 208

## Question

Which source-backed `ProjTypeCollision` and projectile-cancellation semantics can the current TypeScript runtime implement as one bounded, testable slice?

## Answer

IKEMEN's flag changes collision-box selection and enables projectile cancellation through `HitFlag = P`. A bounded port can implement those semantics across projectile-vs-player, projectile-vs-projectile-defense, and player-vs-player contact without claiming the wider collision matrix.

## Primary sources

1. [IKEMEN-GO changed state controllers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29), accessed 2026-07-16. The `ProjTypeCollision` entry says the flag makes a player clash with projectiles and allows same-flag players to clash when their `Clsn2` boxes overlap.
2. [IKEMEN-GO `src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go), `develop`, accessed 2026-07-16. The runtime source is authoritative for box selection, projectile trade/cancel flow, and player collision.

## Findings

### Flag representation

`AssertSpecialFlag` includes `ASF_projtypecollision`. The runtime collision code checks the actor's asserted special flags rather than treating the controller as display-only. This supports a typed actor capability in the port.

### Projectile box selection

`Char.projClsnCheckSingle` receives character and projectile box selectors. When `c.asf(ASF_projtypecollision)` is true it forces both selectors to `2`. Projectile selector `2` reads the current animation frame's `Clsn2`; selector `1` reads `Clsn1`. The port should therefore use current-frame `Clsn2` for the flagged projectile contact path and avoid silently substituting the projectile fallback hitbox when no `Clsn2` exists.

### Player pair contact

`Char.clsnCheckSingle` forces both character box selectors to `2` when both actors assert `ASF_projtypecollision`. The bounded direct-contact route should use both actors' current-frame `Clsn2` boxes only when both flags are active; flag-off contact keeps the existing HitDef hitbox route.

### Projectile cancellation

`CharList.hitDetectionProjectile` checks `HitFlag = P` before normal projectile contact. The cancellation branch requires an active attacker context, compatible team side, the defender's projectile hit flag, projectile collision overlap, and depth overlap. It changes state, flags the projectile for cancellation, records hit contact, then continues without normal projectile damage. The port can model the state transition through the existing defender contact path while keeping removal in the existing projectile terminal/removal system.

### Projectile trade boundary

`Projectile.tradeDetection` also uses projectile collision boxes for projectile-vs-projectile trades. Exact trade ordering and the complete `p2clsncheck` matrix are broader than this ticket and remain deferred. The v1 policy must not imply that all trade behavior is complete.

## Repository evidence

- `src/mugen/runtime/ProjectileCombatSystem.ts` already owns projectile contact, removal marking, and reversal routing.
- `src/mugen/runtime/RuntimeCombatResolutionSystem.ts` already owns direct, priority, and projectile combat bridges.
- `src/mugen/runtime/ProjectileSystem.ts` exposes current-frame Clsn1-derived hitboxes and can expose a separate strict Clsn2 accessor.
- `HitDefSystem.ts` already lowers active HitDef data into `DemoMove`; `hitflag` is the smallest typed addition for this route.

## Decision

Implement `ProjTypeCollision` v1 with four guarded behaviors:

1. typed `projTypeCollision` capability from `AssertSpecial`;
2. strict current-frame projectile `Clsn2` contact when the defender has the capability;
3. `HitFlag = P` cancellation through the existing projectile removal and defender-contact seams;
4. paired player `Clsn2` contact when both players have the capability.

Keep `p2clsncheck`, `p2clsnrequire`, `affectteam`, trade arbitration, depth/order parity, and score claims explicitly open.

## Uncertainty

The current port does not yet expose every IKEMEN attacker-context and team/depth predicate needed for full cancellation parity. The implementation will preserve those boundaries as explicit v1 limitations and add focused tests for the supported world.
