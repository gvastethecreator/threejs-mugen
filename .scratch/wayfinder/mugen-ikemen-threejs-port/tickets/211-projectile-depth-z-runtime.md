# Implement projectile depth Z collision policy/v1

Status: resolved

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

## Answer

Implement the bounded root/player projectile depth contract. Preserve optional
Z offset, velocity, and acceleration through compiler and runtime state; carry
localcoord and attack depth; admit projectile/player contact, HitFlag P
cancellation, and current-frame projectile trades only after inclusive Z
overlap. Preserve legacy XY-only fixture shapes when no authored Z data exists.

## Implementation result

- `ControllerOps` now lowers triple projectile vectors and `attack.depth`.
- Root projectile spawn carries actor combat depth, localcoord, Z position, Z
  velocity, and attack depth into `RuntimeProjectile`.
- Projectile advance, snapshots, player contact, HitFlag P, and projectile
  trade paths use the shared runtime depth oracle.
- Existing helper projectile paths remain XY-only and are explicitly deferred
  from the claim boundary.

## Verification

- Focused batch: 6 files, `147/147` tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Accumulated suite: `216/216` files, `2279/2279` tests passed.
- Production build: `pnpm build` passed; existing chunk-size warning remains.
- Boundary check: `pnpm check:boundaries` passed.
- Trace QA: `pnpm qa:trace` passed, `633/633` artifacts, `0` skipped.
- Browser/renderer smoke: N/A; this slice changes runtime/compiler contracts,
  not a visible UI or renderer surface.

## Commits

- `723f9a4a feat(runtime): implement projectile depth admission`

## Claim ceiling

Verified: authored root/player projectile Z position and velocity, localcoord
scaling, attack depth, inclusive depth admission for projectile/player contact,
HitFlag P, and current-frame Clsn2 projectile trades.

Still open: helper/proxy-owned depth, exact depth-bound removal, perspective or
render ordering, cancel tick ordering, rollback/netplay, score, renderer/audio,
and complete MUGEN/IKEMEN parity.
