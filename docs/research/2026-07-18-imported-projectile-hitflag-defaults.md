# Imported Projectile HitFlag defaults research

## Question

Which source-backed default should an imported Projectile receive when its
HitDef-compatible `hitflag` field is omitted, and where can that default be
introduced without widening synthetic runtime behavior?

## Primary source evidence

- The [Elecbyte HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents `hitflag` as optional and states that omission defaults to `MAF`.
- The same [Elecbyte Projectile reference](https://elecbyte.com/mugendocs-11b1/sctrls.html#Projectile)
  states that Projectile takes all HitDef parameters, so the HitDef default
  applies to the projectile's hit definition as well.
- The pinned [IKEMEN HitDef reset](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L3486-L3522)
  initializes the upstream default as `HF_H | HF_L | HF_A | HF_F`.
- The official [Projectile parameter section](https://elecbyte.com/mugendocs-11b1/sctrls.html#Projectile)
  also documents Projectile spawn defaults separately; those unrelated numeric
  defaults are outside this HitFlag tranche.

## Local ownership audit

- `RuntimeEffectSpawnWorld.spawnProjectile` resolves the sprite/state owner,
  action, position, and attack metadata before delegating to the live effect
  actor world. The owner definition is the narrow imported-source boundary for
  root and state-owner Projectile creation.
- `spawnRuntimeHelperProjectileActor` builds the same typed
  `RuntimeProjectileSpawnInput` for a Helper-owned projectile. T264 already
  passes `defaultHitFlag` into Helper controller execution, making forwarding
  the remaining missing link.
- `createRuntimeProjectile` currently uses the typed operation value or
  `staticHitFlag(raw)`. Applying `defaultHitFlag` after `staticHitFlag` would
  incorrectly assign `MAF` to dynamic raw strings, so the raw-field presence
  must be checked first.
- `ModifyProjectile` mutates live projectiles and already preserves omission;
  it should not infer a new default from an absent mutation field.

## Decision for T265

1. Carry an optional `defaultHitFlag` on projectile spawn input.
2. Resolve operation HitFlag, then static raw HitFlag, then default only when
   no raw HitFlag parameter exists.
3. Scope the default to `source: "imported"` at root/state-owner and Helper
   spawn boundaries using the T264 provenance helper.
4. Preserve omitted demo/synthetic values and dynamic raw strings as
   unresolved.

## Non-claims

- This does not evaluate dynamic CNS string expressions.
- It does not change `ModifyProjectile` omission behavior.
- It does not prove exact projectile pause/contact timing, reversals, clashes,
  `acttmp`/`hittmp`, or full MUGEN/IKEMEN parity.

## Implementation outcome

The bounded decision shipped in `9b0122fa` after planning in `0fabf9cc`; the
synthetic down-hit fixture correction is recorded in `2f65c1c6`. Projectile
spawn input now distinguishes an absent raw field from a dynamic raw string,
passes the imported source default through root/state-owner and Helper spawn,
and leaves live `ModifyProjectile` omission unchanged. Focused coverage passes
`3` files / `104` tests. The grouped suite passes `230/230` files / `2424/2424`
tests, build, TypeScript 7, repository boundaries, redirect boundary, diff
hygiene, and trace QA `633/633` artifacts (`599` required, `34` optional).
