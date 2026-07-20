# T329 - FightScreen hit-source cause

Status: resolved at bounded root hit-source cause scope
Date: 2026-07-20

## Source evidence

Ikemen-GO reads the hit context attack attribute and guard-KO flag when a
character reaches zero from hit state. The result order keeps cheese ahead of
hyper, special, throw, and normal attack causes after suicide and teammate
ownership checks.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`
- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, attack-type masks

## Delivered

- Extended direct HitDef and projectile `GetHitVar` metadata with effective
  source attr and an explicit guard-KO fact.
- Preserved the direct `S,NA` and projectile `S,SP` defaults in source metadata.
- Let an opposing root-owned hit source retain cheese or
  normal/special/hyper/throw cause when a later hit-state resource write brings
  the victim to zero.
- Kept same-player suicide, same-team teammate, rival-without-cause, helper,
  and incomplete identity paths fail-closed.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts`
  passed: 4 files / 349 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers root-owned explicit source identity, attack attr, and
guard-KO context through the direct/projectile hit-state path. Helper-owned
source admission, redirected resources, reversal/reflection, exact source-slot
arbitration, direct screenpack proof, and complete MUGEN/IKEMEN result parity
remain open.

## Next boundary

Audit helper-owned and redirected hit sources as separate admission paths before
widening the classifier to reversal/reflection or other non-root ownership.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go`
- `.scratch/external/Ikemen-GO/src/bytecode.go`
