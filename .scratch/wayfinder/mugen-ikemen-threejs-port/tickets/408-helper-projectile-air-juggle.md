# T408 Helper Projectile `air.juggle`

Type: task

Status: resolved bounded in `0f9dd991`

Blocked by: None

## Question

Can Helper-created Projectiles reuse the T407 IKEMEN `air.juggle` path using the
local `ownerId` contract, while preserving root boundaries and avoiding claims
about `inheritJuggle` or nested Helper ancestry?

## Answer

Yes, within the local ownership contract. The runtime keeps `rootId ===
attacker.id` as the admission boundary, resolves a matching Helper from
`ownerId`, and uses that Helper id for the target budget and `NoJuggleCheck`.
Root-owned Helper-parented projectiles keep the root key; missing Helper
records fall back to root.

The required imported trace passes: a Helper `ownprojectile` spends `3` from
`data.airjuggle = 4`, a later contact is rejected before HitOverride, the
Projectile remains active with one hit available, and owner/helper target links
are recorded. Focused closure passed 6 files / 255 tests with 582 filtered.

Typecheck remains blocked by the pre-existing unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`; the global formal cursor
stays at `f5f2315e`.

## In scope

- Owner identity selection from `RuntimeProjectile.ownerId`.
- Root-owned Helper-parented and Helper-owned Projectile admission/spend.
- Helper `NoJuggleCheck` flag lookup when the owner is present.
- Focused world tests, required imported trace, research, roadmap, and backlog.

## Out of scope

- Exact `hittmp`/`acttmp`, `inheritJuggle`, nested Helper ancestry, destroyed
  owners, MUGEN branch, teams/clashes, `ModifyHitDef`, global checkpoint,
  scores, and full parity.
