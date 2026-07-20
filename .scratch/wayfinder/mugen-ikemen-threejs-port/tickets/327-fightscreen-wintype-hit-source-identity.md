# T327 - FightScreen hit source identity

Status: resolved at bounded explicit-player identity scope  
Date: 2026-07-20

## Source evidence

Ikemen-GO stores the attacking player number in hit context and reads it from
`ghv.playerno` when `Char.lifeSet` classifies a life-zero transition. The
identity is needed before distinguishing self KO, teammate KO, and an
opponent-owned result while the victim is in hit state.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`

## Delivered

- Added optional source identity fields to runtime `GetHitVar` metadata:
  `sourcePlayerNo`, `sourceActorId`, `sourceRootId`, and `sourceRootOwned`.
- Shared the metadata builder across direct HitDef and projectile contact.
- Carried explicit root player numbers through direct/projectile combat
  actors; helper direct actors preserve their root ancestry for later policy.
- Marked helper-parented projectiles as non-root-owned evidence without
  changing their existing combat behavior.
- Kept metadata absent when the runtime has no explicit player number, so
  legacy/demo callers do not gain guessed identity.

## Verification

- `pnpm exec vitest run src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeHelperCombatSystem.test.ts`
  passed: 5 files / 352 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket carries identity metadata only. It does not classify hit-state
suicide or teammate results, prove helper-owned source admission, cover
reversal/reflection, alter score movement, provide direct screenpack proof, or
claim complete MUGEN/IKEMEN result parity.

## Next boundary

Use the explicit `GetHitVar` source identity to classify root hit-state suicide
and teammate KO, with fail-closed handling for unknown player slots.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/char.go`
