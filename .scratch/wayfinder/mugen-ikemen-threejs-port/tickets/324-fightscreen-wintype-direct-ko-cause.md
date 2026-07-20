# T324 - FightScreen direct KO cause

Status: resolved at bounded direct-hit scope
Date: 2026-07-20

## Source evidence

Ikemen-GO assigns the base win type when `Char.lifeSet` reaches zero. The
source order is explicit:

1. suicide
2. teammate
3. guard KO (`cheese`)
4. hyper attack (`AT_AH`)
5. special attack (`AT_AS`)
6. throw (`AT_AT`)
7. normal fallback

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`
- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, attack-type masks

## Delivered

- Added transient `roundWinType` evidence to root runtime state.
- Recorded a base type only when a direct hit changes the defender from alive
  to life zero.
- Mapped guard KO to `cheese`, then applied the source attack-mask order for
  hyper, special, throw, and normal.
- Passed the recorded base type into the winner display selection so a later
  perfect or clutch upgrade can retain `[perfect, special]` or the matching
  base record.
- Let fighter reconstruction clear the transient field at round reset.

## Verification

- `pnpm exec vitest run src/tests/DirectCombatSystem.test.ts src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts src/tests/MugenSystemAssetsLoader.test.ts`
  passed: 4 files / 70 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers direct root-compatible HitDef and guard-KO cause facts.
It does not claim suicide or teammate ownership, projectile cause, helper
cause, reversal cause, exact source player-type admission, or complete
MUGEN/IKEMEN result parity.

## Next boundary

Carry the same cause contract through projectile contact and confirm the
source ownership rules before allowing non-root actors to affect the result.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go`
- `.scratch/external/Ikemen-GO/src/bytecode.go`
