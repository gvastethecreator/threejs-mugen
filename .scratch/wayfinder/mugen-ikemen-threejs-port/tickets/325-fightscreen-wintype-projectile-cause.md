# T325 - FightScreen projectile KO cause

Status: resolved at bounded root-owned projectile scope  
Date: 2026-07-20

## Source evidence

Ikemen-GO assigns the base result when `Char.lifeSet` reaches zero. The
attack masks and source order used by T324 also apply when the contact carries
an attack attr through the projectile path.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`
- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, attack-type masks

## Delivered

- Extracted the KO-cause classifier into `RuntimeRoundWinTypeSystem` so direct
  HitDef and projectile contact share one source-ordered mapping.
- Recorded a projectile cause only on an alive-to-zero transition after the
  projectile combat result has resolved.
- Allowed root-owned projectiles, identified by `parentId === rootId`, to
  carry normal, special, hyper, throw, or cheese into round result selection.
- Kept helper-owned projectiles fail-closed until helper ownership and source
  slot admission have their own evidence.
- Applied the projectile combat default attr `S,SP` when an active projectile
  omits its attr.

## Verification

- `pnpm exec vitest run src/tests/ProjectileCombatSystem.test.ts src/tests/DirectCombatSystem.test.ts src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts`
  passed: 4 files / 105 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers root-owned projectile contact and the existing result
composition bridge. It does not claim helper-owned projectile causes,
reversal/reflection ownership, suicide, teammate, exact source player-slot
admission, projectile custom-state timing, direct screenpack proof, or complete
MUGEN/IKEMEN result parity.

## Next boundary

Resolve source-owned suicide, teammate, and reversal causes before widening
the result classifier to non-standard KO paths.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go`
- `.scratch/external/Ikemen-GO/src/bytecode.go`
