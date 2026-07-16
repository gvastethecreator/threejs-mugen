# Implement helper-owned Projectile Z spawn/localcoord v1

Type: task
Status: resolved
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

## Implementation result

- Helper controller positions now preserve an optional third component through
  the typed compiler operation and runtime helper origin.
- Helper-created Projectiles now resolve their third `offset`/`pos` component
  against the helper origin for `P1` and the supplied opponent runtime origin
  for `P2`, while preserving the existing root-store/parent identity.
- Zero and omitted depth retain the legacy object shape; local-coordinate
  metadata remains attached to the spawned Projectile.

## Evidence

- Focused compiler/effect/spawn tests: `124/124` passed.
- `pnpm typecheck`: passed.
- Full suite: `216/216` files and `2284/2284` tests passed with
  `--testTimeout=30000`.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed, `0` skipped (`599` required,
  `34` optional); artifacts in `.scratch/qa/trace-gates`.
- Code commits: `bf12d7eb`, `5297bb65`.

Claim ceiling: spawn-time helper/P1/P2 Z projection is evidenced under the
existing owner/store contract. Helper Z kinematics, binding writeback,
cross-localcoord conversion, collision/presentation breadth, rollback/netplay,
and complete MUGEN/IKEMEN parity remain open.
