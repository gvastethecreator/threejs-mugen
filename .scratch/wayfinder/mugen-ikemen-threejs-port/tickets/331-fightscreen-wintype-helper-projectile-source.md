# T331 - FightScreen Helper Projectile source

Status: resolved at bounded first-generation Helper Projectile scope
Date: 2026-07-20

## Source evidence

Ikemen-GO finalizes Projectile hit context from the projectile's inherited
`playerno` and owner identity. A Helper-created Projectile keeps the Helper as
its owner while carrying the root player slot. `Char.lifeSet` then reads that
context when a player root reaches zero from hit state.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, Projectile HitDef finalization
  and `Char.lifeSet`

## Delivered

- Added a Projectile hit-source resolver shared by direct Projectile combat and
  the production combat bridge.
- Preserved the Helper serial as `sourceActorId`, the root as `sourceRootId`,
  and the inherited player slot in `GetHitVar` metadata.
- Admitted a Helper Projectile only when its store root, Helper root, immediate
  parent, projectile parent, attacker slot, and Helper root slot agree.
- Kept unknown and nested Helper Projectiles fail-closed while root-owned
  Projectiles retain their existing path.

## Verification

- `pnpm exec vitest run src/tests/ProjectileCombatSystem.test.ts src/tests/RuntimeCombatResolutionSystem.test.ts src/tests/RuntimeHelperCombatSystem.test.ts src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`
  passed: 5 files / 367 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers first-generation Helper Projectile source identity in the
production combat bridge. It does not claim nested Helper ancestry, redirected
ownership, reversal/reflection, exact source-slot arbitration, helper-owned
non-root target state, direct screenpack proof, or complete MUGEN/IKEMEN result
parity.

## Next boundary

Audit redirected resource and target paths separately before admitting any
source whose actor identity changes during dispatch.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/char.go`
