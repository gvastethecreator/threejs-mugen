# Projectile HitFlag admission research

## Question

Which projectile HitFlag boundary is source-backed and implementation-ready
without widening the current partial projectile timing model?

## Primary source evidence

- The [Elecbyte Projectile controller reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  states that Projectile takes all HitDef parameters, so its authored
  `hitflag` controls the projectile HitDef. The [HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  defines `H/L/A/M/F/D`, `+`, and `-`, and documents omitted hitflags as
  defaulting to `MAF`.
- The pinned [IKEMEN GO projectile contact loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L13493-L13538)
  checks projectile cancellation through the defender's `P` HitFlag, then
  calls `hittableByChar` with the projectile's own nested HitDef before
  resolving contact. That nested HitDef is initialized with the normal
  HitFlag default by [`HitDef.reset`](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L684-L710).
- The pinned [IKEMEN HitFlag predicate](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10440-L10461)
  applies state type, fall/NoFallHitFlag, minus, and plus checks in the same
  order already used by the sandbox's direct admission predicate.
- The pinned [IKEMEN ModifyProjectile implementation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/bytecode.go#L8600-L8612)
  updates each live projectile's nested HitDef `hitflag`, proving that the
  field is mutable after spawn.

## Repository audit

- `ProjectileControllerOp` currently carries many HitDef fields but omits
  `hitFlag`; `RuntimeProjectile` and its `ActorEffectSnapshot` projection do
  the same.
- `ModifyProjectileControllerOp` and the runtime mutation loop also omit
  `hitFlag`.
- `ProjectileCombatSystem` already shares the projectile target, depth,
  reversal, HitBy/NotHitBy, override, and damage route, but does not call the
  shared explicit HitFlag predicate before HitBy/NotHitBy.
- Root and helper direct routes already pass the owner runtime into the shared
  predicate, so projectile code can preserve root NoFallHitFlag attribution.

## Decision for T263

Implement one explicit projectile field path:

1. Compile `hitflag` for Projectile and static ModifyProjectile operations.
2. Store it on the live projectile and expose it in effect snapshots.
3. Mutate it on matching active projectiles.
4. Reject projectile/player contact with the shared state/fall/minus/plus
   predicate before HitBy/NotHitBy and override handling.
5. Leave an omitted field undefined so the current compatibility behavior does
   not change while default `MAF` inference remains separately auditable.

## Uncertainty and non-claims

- Dynamic/string `ModifyProjectile.hitflag` expressions are not part of this
  tranche; the current typed resolver supports numeric and pair expressions,
  not string expression evaluation.
- This does not establish exact projectile pause, one-frame invulnerability,
  `acttmp`, `hittmp`, clash, reversal, target order, or custom-state parity.
- Snapshot visibility is diagnostic state, not proof of renderer parity.

## Implementation outcome

Implemented in `f6990dff` after planning commit `597b03bf`. Static Projectile
and ModifyProjectile HitFlags now reach typed runtime state, mutation, and
effect snapshots; projectile/player contact applies the shared explicit
HitFlag predicate before HitBy/NotHitBy and override handling. Focused coverage
passed `3` files / `115` tests; grouped evidence passes `230` files / `2418`
tests, TypeScript 7, build, repository boundaries, redirect boundary, diff
hygiene, and `qa:trace` `633/633` (`599` required, `34` optional). Browser
smoke is N/A. Omitted/default inference, dynamic string expressions, reversal
admission, exact projectile pause/contact timing, and full parity remain open.
