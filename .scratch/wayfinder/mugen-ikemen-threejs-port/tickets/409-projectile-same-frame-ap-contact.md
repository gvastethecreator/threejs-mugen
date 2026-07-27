# T409 Projectile same-frame `AP` contact

Type: task

Status: resolved bounded in `4395f2dd`

Blocked by: None

## Question

Can the local projectile combat pass enforce Ikemen's `ap_projhit` rule for
multiple `AP` projectiles from one owner while leaving exact `hittmp` and
`acttmp` timing outside the slice?

## Bounded answer

`RuntimeProjectileCombatWorld` keeps a pass-local `AP` contact mark for the
current ordered owner/defender pass. It sets the mark after an accepted hit,
guard, or HitOverride contact from an `AP` projectile. It rejects later `AP`
projectiles in that pass before HitOverride and damage, keeps non-`AP`
projectiles eligible, and clears the mark at the next combat pass.

## In scope

- Existing projectile attribute parsing for the `AP` family.
- Same-owner ordered projectile admission in `ProjectileCombatSystem`.
- Focused positive and negative contact cases.
- One imported trace with two overlapping `AP` projectiles.
- Research and evidence updates.

## Out of scope

- Exact `hittmp` and `acttmp` timing.
- Persistent pause-time invulnerability, MUGEN-only behavior, teams, clashes,
  `inheritJuggle`, nested Helpers, and full projectile parity.

## Evidence target

The required trace should show one accepted `AP` projectile, one same-frame
rejection, one remaining second projectile, and exactly one damage application.

## Implementation result

- `ProjectileCombatSystem` identifies the projectile family through the
  existing `parseHitAttribute` path and applies the mark after accepted
  contact, so geometry misses, HitBy/NotHitBy, air-juggle rejection, and
  `missonoverride = 1` do not consume it.
- `ProjectileCombatSystem.test.ts` covers two same-frame `AP` projectiles and
  the non-`AP` bypass. The imported trace
  `synthetic-imported-ikemen-projectile-same-frame-ap-contact-golden` covers
  accepted contact, rejection, retained projectile evidence, and final P2
  life `983`.
- Focused closure passed 6 files / 258 tests with 582 filtered; the trace test,
  `node --check scripts/qa_traces.cjs`, and `git diff --check` passed.
- The broad typecheck was deferred after this implementation batch. The known
  unrelated blocker remains the unused `advanced` at
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

Claim allowed: bounded same-frame `AP` admission in the current projectile
combat world. Claim ceiling: exact `hittmp`/`acttmp`, pause persistence,
MUGEN-only behavior, teams/clashes, helper ancestry, `inheritJuggle`, and full
projectile parity remain open.
