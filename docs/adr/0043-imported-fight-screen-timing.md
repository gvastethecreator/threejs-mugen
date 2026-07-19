# ADR 0043: Imported Fight-Screen Timing

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The runtime had a shared timing contract, but imported packages still lost the
`[Round]` values from their resolved `fight.def`. The loader already owned that
file for FightFX references, so adding a second global parser would duplicate
source selection and provenance. IKEMEN-GO confirms that the values govern
separate post-round boundaries, but exact release ownership remains outside
the current browser port.

## Decision

- Parse numeric `over.waittime`, `over.hittime`, `over.wintime`,
  `over.forcewintime`, `over.time`, `slow.time`, `slow.fadetime`, and
  `slow.speed` from the resolved `[Round]` section in `fight.def`.
- Preserve the values and `sourcePath` as `MugenFightScreenTiming` inside
  `MugenSystemAssets`, then carry that metadata into imported fighter
  definitions.
- Let `PlayableMatchRuntime` select explicit `roundTiming` options first,
  then imported P1/P2 fight-screen timing, then the default contract.
- Map `over.waittime`, `over.wintime`, and `over.time` into runtime timing. Keep
  `over.hittime` and `over.forcewintime` as metadata until release/choreography
  systems own their behavior.

## Consequences

Real imported `fight.def` timing can now affect bounded phase-4 opening,
win-pose readiness, post-KO duration, slowdown, and fade without changing demo
defaults. Source provenance survives the loader boundary, while unsupported
release semantics remain visible rather than being silently approximated.

## Evidence

- Implementation: `src/mugen/loader/MugenSystemAssetsLoader.ts`,
  `src/mugen/runtime/importedFighter.ts`, and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Tests: `src/tests/MugenSystemAssetsLoader.test.ts`,
  `src/tests/importedFighter.test.ts`, and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `93e1429a`.
- Focused verification: `4` loader/import/runtime tests passed,
  `pnpm typecheck` passed, and `git diff --check` passed.
- Wide checkpoint: `233` test files / `2459` tests, build, typecheck, both
  boundary checks, and `633/633` trace artifacts passed without golden
  refresh.
- Sources: [pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683), [pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268), [pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174).
