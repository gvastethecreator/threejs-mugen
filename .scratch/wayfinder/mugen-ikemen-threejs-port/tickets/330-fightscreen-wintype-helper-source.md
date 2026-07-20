# T330 - FightScreen helper source admission

Status: resolved at bounded first-generation Helper scope
Date: 2026-07-20

## Source evidence

Ikemen-GO finalizes a direct HitDef with the attacking character's `playerNo`.
Helpers inherit that slot from their root. `Char.lifeSet` records a win type
only when the victim is a player root (`helperIndex == 0`), then reads the
inherited hit source context.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `HitDef.finalizeParams` and
  `Char.lifeSet`

## Delivered

- Added explicit `rootOwned` provenance to direct combat source actors.
- Marked a Helper direct HitDef source as root-owned only when its root is the
  combat owner, its parent is that root, and inherited `playerNo` matches
  `rootPlayerNo`.
- Kept nested Helpers, missing identity, and non-root source paths outside the
  hit-state KO classifier.
- Preserved source attr and guard-KO fields through the admitted Helper route.

## Verification

- `pnpm exec vitest run src/tests/RuntimeHelperCombatSystem.test.ts src/tests/DirectCombatSystem.test.ts src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`
  passed: 4 files / 319 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers first-generation Helper direct HitDef source provenance in
the root combat owner path. It does not claim nested Helper ancestry, Helper
Projectile source admission, redirected target/resource ownership,
reversal/reflection, exact source-slot arbitration, direct screenpack proof, or
complete MUGEN/IKEMEN result parity.

## Next boundary

Carry the same verified root identity into Helper-parented Projectile hit
metadata as a separate projectile admission slice.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/char.go`
