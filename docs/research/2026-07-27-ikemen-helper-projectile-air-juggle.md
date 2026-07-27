# IKEMEN Helper Projectile `air.juggle` Research

## Question

Which owner identity should a Helper-created Projectile use for IKEMEN
`air.juggle`, and can the local runtime extend T407 without guessing about
`inheritJuggle` or nested Helper ancestry?

## Answer

Yes, for the local ownership model. IKEMEN resolves projectile combat from
`p.owner()`, then reads and writes the target's juggle entry with that owner's
id. The local runtime already records `ownerId`, `rootId`, and `parentId` on
every Projectile. A bounded extension can use `ownerId` as the juggle key,
rehydrate a Helper's `NoJuggleCheck` flag when `ownerId` is a Helper, and keep
`rootId === attacker.id` as the root-owned admission boundary.

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- [`hitDetectionProjectile` owner and admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L13460-L13602)
- [`HitDef` projectile owner identity](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L830-L840)
- [`Projectile` juggle spend/reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11490-L11505)

## Findings

1. `hitDetectionProjectile` assigns `c := p.owner()`. The same `c.id` feeds
   `getter.ghv.getJuggle(c.id, ...)`, so the budget key follows projectile
   owner identity, not `parentId` alone.
2. The admission condition keeps the IKEMEN `getter.hittmp < 2` branch and
   compares `p.hitdef.air_juggle` with the target entry. `NoJuggleCheck` reads
   from the projectile owner.
3. After a hit, falling contacts subtract `hd.air_juggle` from the last target
   entry. The projectile branch does not reset the owner's character `c.juggle`.
4. The local `spawnRuntimeHelperProjectileActor` already maps
   `ownProjectile = true` to `ownerId = helper.serialId`; other Helper
   projectiles retain the root owner id while preserving `parentId = helper`.
5. This cut can cover that existing owner split. It cannot claim exact
   `inheritJuggle`, nested Helper owner lookup, source scheduling, or team
   semantics without new evidence and state contracts.

## Local implementation contract

Under `runtimeProfile = "ikemen-go"`:

- Any Projectile with `rootId === attacker.id` may enter the bounded projectile
  air-juggle path.
- `projectile.ownerId` selects the target budget key and the owner's
  `NoJuggleCheck` flag when a matching Helper exists.
- Root-owned Helper-parented projectiles use the root fighter key.
- `ownProjectile` Helper projectiles use the Helper key.
- MUGEN/unknown profiles retain the prior behavior.
- Missing Helper owner records fail closed to the root actor and do not invent
  a new identity.

## Implementation result

`0f9dd991` implements this contract. The runtime bridge resolves a matching
Helper from the active root's effect world, passes its `assertSpecial` and
`moveType` into the bounded projectile juggle decision, and keeps root-owned
Helper-parented projectiles on the root actor. The imported trace
`synthetic-imported-ikemen-helper-projectile-air-juggle-golden` passes with a
`3`-point spend from `data.airjuggle = 4`, a later rejection before
HitOverride, one remaining Projectile hit, and owner/helper target links.

Focused closure passed 6 files / 255 tests with 582 filtered. The global
typecheck remains blocked by the unrelated pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`; the formal/global cursor is
unchanged.

## Local evidence

- `src/mugen/runtime/EffectActorSystem.ts`: Helper Projectile owner mapping.
- `src/mugen/runtime/RuntimeCombatResolutionSystem.ts`: root combat actor and
  Helper registry available at projectile resolution.
- `src/mugen/runtime/ProjectileCombatSystem.ts`: projectile admission/spend.
- `src/tests/ProjectileCombatSystem.test.ts`: direct world boundary cases.
- Required trace: `synthetic-imported-ikemen-helper-projectile-air-juggle-golden`.

## Open questions

- Exact `hittmp`/`acttmp` timing and projectile contact memory.
- `inheritJuggle`, nested Helpers, and destroyed owner behavior.
- MUGEN branch, teams, clashes, redirects, `ModifyHitDef`, and full parity.
