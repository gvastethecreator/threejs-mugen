# ADR 0049: Bounded FightScreen Fade Assets and Sound

## Status

Accepted for bounded runtime and presentation evidence. 2026-07-18.

## Context

ADR 0048 carried imported `fadeout.time` and `fadeout.col` into a local
color/opacity overlay but left the FightScreen asset references metadata-only.
IKEMEN reads `fadeout.anim` and `fadeout.snd`, includes the resolved animation
length in fade duration, draws the animation in the fade rectangle, and plays
the configured sound at fade start.

## Decision

- Parse non-negative `fadeout.anim` and `fadeout.snd` from imported `[Round]`
  timing and omit `-1` or malformed values.
- Resolve the referenced FightFX AIR action after the FightFX package loads and
  enrich the source-derived terminal duration with its effective frame length.
- Publish optional animation and sound metadata from `RuntimeRoundFade/v0`.
- Render a resolved AIR/SFF action through a viewport-wide Three.js layer with
  bounded frame duration, loop, offset, flip, and blend handling.
- Route the global sound through the existing prefixed FightFX audio archive,
  deduplicated by round/state/sound key.
- Keep the existing color layer as an explicit fallback when the configured
  animation or sprite cannot be resolved, and expose the reason in renderer
  diagnostics.

## Consequences

Imported packages can present their bounded FightScreen fade asset and sound
without making the core round system depend on Three.js or actor ownership.
Missing assets fail visibly and diagnostically. The adapter does not assert
exact screenpack localcoord behavior or complete release choreography.

## Rejected scope

Exact motif/localcoord transforms, fade-in ownership, `intro`/`roundOver`
frame-start ordering, dialogue, skip input, `RoundNoSkip`, Common1/ZSS
execution, Teams/Turns, rollback/netplay, score changes, and full
MUGEN/IKEMEN parity remain separate gates.

## Evidence

- Implementation: `src/mugen/loader/MugenSystemAssetsLoader.ts`,
  `src/mugen/runtime/RuntimeRoundSystem.ts`,
  `src/game/render/RoundFadeRenderer.ts`,
  `src/game/render/ThreeMugenRenderer.ts`, and
  `src/game/audio/MugenAudioSystem.ts`.
- Commit: `84fc1510`.
- Sources: [pinned IKEMEN fade reader](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3398-L3420), [pinned round-state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268), and local `.scratch/external/Ikemen-GO/src/rect.go`.
- Grouped checkpoint: 233 test files / 2476 tests, TypeScript 7, build, 633/633 traces, boundaries, CSS budget, and 64-path browser smoke passed with zero console/page errors.
