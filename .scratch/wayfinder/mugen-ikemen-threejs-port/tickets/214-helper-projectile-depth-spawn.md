# Implement helper-owned Projectile Z spawn/localcoord v1

Type: task
Status: in progress
Blocked by: None

## Question

Does a Projectile created while a Helper state is executing preserve the
helper-relative Z origin and the third component of `offset`/`pos`?

## Answer

Close the bounded spawn path only. Keep the existing helper/root ownership and
XY `postype` behavior, add an optional Z component to the typed Helper origin,
and resolve helper-created Projectile Z as the helper or selected P2 origin
plus the authored third offset. Omitted or zero depth keeps the legacy object
shape without inventing a new depth value.

## Authority

- IKEMEN's `commitProjectile` calls `helperPos` with `offx`, `offy`, and
  `offz`, then writes all three coordinates to the live Projectile.
- IKEMEN's `helperPos` uses the helper/P2 Z origin for `P1`/`P2` and the
  authored Z offset for front/back/left/right positions.
- The changed-controller reference treats Projectile vectors as positional
  data, while this slice does not widen the controller family beyond the
  existing typed triple parser.

## Boundaries

Included: typed Helper position triple, helper initial Z origin, helper-local
Projectile `offset`/`pos` Z spawn, local-coordinate metadata preservation, and
production-path focused tests.

Deferred: helper Z velocity/acceleration, `BindToParent`/`BindToRoot` Z
writeback, cross-localcoord scaling, P2/team/proxy ownership breadth, collision
admission, depth-bound policy, perspective rendering, rollback/netplay, and
complete MUGEN/IKEMEN parity.

## Verification target

- Compiler test covers a static Helper `pos` third component.
- Effect-spawn integration proves helper Z origin plus helper-created
  Projectile Z offset.
- Helper effect-actor coverage proves the actual helper micro-VM spawn path.
- TypeScript 7 and the accumulated runtime checkpoint close the slice.

## Sources

- `docs/research/2026-07-16-helper-projectile-depth-spawn.md`

