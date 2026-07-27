# IKEMEN Projectile Same-frame `AP` Contact Research

## Question

What local rule should prevent two projectile attacks from the same owner from
contacting one defender during the same frame, and how does it relate to the
separate `hittmp` and `acttmp` work?

## Answer

The next bounded rule is the local equivalent of Ikemen's `ap_projhit` flag:
once one projectile attack with an `AP` attribute has an accepted contact for a
defender during one owner combat pass, later `AP` projectiles from that owner
must wait for the next frame. A projectile with a non-`AP` attribute remains
eligible in that pass. The flag belongs to the current combat pass and does not
become projectile state.

This is a smaller contract than exact `hittmp` or `acttmp` timing. Those values
also affect hit flags, standing/get-hit admission, and pause behavior in the
source. They remain a separate research and implementation item.

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- [`hitDetectionProjectile` and the per-owner projectile loop](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12784-L12955)
- [`hittmp` reset in the get-hit lifecycle](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11317-L11383)

## Findings

1. `hitDetectionProjectile` starts `ap_projhit` as `false` for each projectile
   owner group checked against the current defender.
2. The projectile admission condition rejects later `AP` projectiles after an
   accepted contact, while allowing a non-`AP` projectile through.
3. The source comment describes this as the one-frame rule for multiple
   projectiles from one player. It also records that MUGEN gives the defender a
   one-frame projectile invincibility timer that persists through pause.
4. The local `RuntimeEffectActorWorld.resolveProjectileCombat` already provides
   one ordered projectile list for an owner and defender. A pass-local boolean
   therefore matches the available ownership boundary without adding state to
   `RuntimeProjectile` or `CharacterRuntimeState`.
5. Local projectiles use attributes such as `S,SP`; the second token character
   `P` identifies the projectile family in the existing attribute parser.

## Local implementation contract

Under the current runtime profile and combat world:

- An accepted `AP` projectile contact marks the current owner/defender pass.
- A later `AP` projectile in the same pass is rejected before HitOverride and
  before damage or projectile contact memory.
- A non-`AP` projectile remains eligible after the mark.
- A new combat pass starts with a clear mark.
- Reversal, geometry misses, HitBy/NotHitBy rejection, air-juggle rejection,
  and `missonoverride = 1` do not consume the mark.
- Exact pause persistence, `hittmp`, `acttmp`, MUGEN branch behavior, teams,
  and full projectile parity remain outside this cut.

## Implementation result

Commit `4395f2dd` implements the bounded rule in
`src/mugen/runtime/ProjectileCombatSystem.ts`. The existing ordered projectile
pass uses `parseHitAttribute` to identify `AP`; a pass-local mark rejects later
`AP` projectiles before HitOverride and damage, while accepted guard, hit, or
HitOverride contact marks the pass. The mark is local to the current combat
resolution and does not persist in projectile or actor state.

Focused evidence passed:

- `ProjectileCombatSystem.test.ts`: the two-`AP` same-frame case and the
  non-`AP` bypass.
- `RuntimeTraceGatePresets.test.ts`: required imported trace gate
  `synthetic-imported-ikemen-projectile-same-frame-ap-contact-golden`.
- 6-file accumulated filter: 258 passed, 582 skipped.
- `node --check scripts/qa_traces.cjs` and `git diff --check`.

The broad typecheck was deferred after this batch. The known unrelated
blocker remains `src/mugen/da32/ClauseAdjudicationSample.ts:149`, where
`advanced` is unused. This evidence supports the bounded local claim only.

## Local evidence

- `src/mugen/runtime/ProjectileCombatSystem.ts`: ordered projectile combat pass.
- `src/mugen/runtime/ProjectileSystem.ts`: projectile attributes and contact
  state.
- `src/tests/ProjectileCombatSystem.test.ts`: focused two-`AP` admission case.
- Required trace: `synthetic-imported-projectile-same-frame-ap-contact-golden`.

## Open questions

- Exact MUGEN pause persistence and whether local pause phases need a retained
  defender timer rather than a pass-local flag.
- Interaction with `hittmp`, `acttmp`, projectile `hitonce`, `projmisstime`,
  HitOverride, ReversalDef, and helper owner ancestry.
- Team-wide owner grouping, projectile clashes, and full MUGEN/IKEMEN parity.
