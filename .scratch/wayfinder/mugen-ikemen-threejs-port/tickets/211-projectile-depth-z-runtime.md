# Implement projectile depth Z collision policy/v1

Status: active

## Question

What bounded runtime contract closes the next projectile compatibility gap after
`AffectTeam`: authored projectile Z position/velocity and attack depth must
participate in player contact, HitFlag P cancellation, and projectile trades?

## Authority

- IKEMEN GO stores projectile position and velocity as three-dimensional values.
- IKEMEN GO carries `HitDef.attack_depth` for projectiles and uses the owning
  character's combat-depth defaults when a projectile does not override it.
- IKEMEN GO normalizes depth values through the actor local scale and checks Z
  overlap before the current-frame collision boxes in player/projectile contact
  and projectile trade paths.

## Bounded implementation

- Extend the typed Projectile operation boundary to preserve the third offset
  and velocity components and the projectile `attack.depth` override.
- Keep projectile depth state separate from the existing XY collision boxes,
  with local-coordinate metadata carried at spawn time.
- Reuse the shared runtime combat-depth overlap oracle for projectile versus
  player, HitFlag P cancellation, and projectile versus projectile trade.
- Preserve touching depth edges as contact and reject separated Z ranges before
  XY box admission.
- Keep the default projectile depth at the existing runtime attack-depth
  default when authored data does not provide an override.

## Allowed claims

- Typed root/player projectile Z position, Z velocity, local-coordinate scaling,
  and attack-depth admission on the covered runtime routes.
- Paired XY plus Z admission for projectile player contact, HitFlag P, and
  current-frame Clsn2 projectile trades.

## Blocked claims

- Full proxy flattening and helper-owned depth parity, exact depth-bound removal,
  perspective/render ordering, cancel tick ordering, rollback/netplay, score,
  renderer/audio parity, or complete MUGEN/IKEMEN parity.

## Verification target

- Focused compiler, combat-depth, projectile, projectile-combat, and runtime
  resolution tests.
- TypeScript 7, production build, boundary checks, trace QA, and the full suite
  at the accumulated checkpoint.

## Selection evidence

- Selected after Wayfinder 210 because the roadmap explicitly leaves projectile
  depth/order open and the official source gives a self-contained admission
  contract.
- Source note: `docs/research/2026-07-16-projectile-depth-z-runtime.md`.

