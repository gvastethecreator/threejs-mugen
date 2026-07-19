# Research: FightScreen round-start and fade-in boundary

Date: 2026-07-18
Ticket: [T285](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/285-round-fadein-boundary.md)

## Question

Which source-backed part of the FightScreen round-start contract can be added
after T284 without taking ownership of the complete intro, shutter, motif, or
release sequence?

## Primary sources

- [Pinned IKEMEN-GO FightScreen source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go):
  `FightScreenRound.reset`, `act`, `drawFade`, and the `readLbFade` reader.
- [Pinned IKEMEN-GO round-state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268):
  round-state stepping and release ownership remain outside actor rendering.
- Local source: `.scratch/external/Ikemen-GO/src/rect.go`, `Fade.init`,
  `Fade.duration`, `Fade.step`, and `Fade.draw`.
- Local source: `.scratch/external/Ikemen-GO/src/fightscreen.go`,
  `FightScreenRound.reset`, `FightScreenRound.act`, and `drawFade`.

## Local findings

- `FightScreenRound.reset` resets the fade-out and initializes the imported
  fade-in with `isFadeIn = true`; the fade therefore belongs to the
  FightScreen round boundary rather than to an actor state.
- `FightScreenRound.act` steps fade-out first and fade-in only when fade-out is
  inactive. `drawFade` uses the same priority and keeps shutter drawing as a
  separate concern.
- `Fade.duration` is the maximum of the color fade time and the resolved
  animation length. When animation data exists, `colorFadeTime` is zero, so
  animation-backed presentation does not double-apply the color layer.
- `Fade.step` plays the configured sound at the first active step. A local
  snapshot event is therefore routed through the existing global FightFX sound
  path rather than assigned to a synthetic actor.
- The existing local loader already has normalized FightFX AIR actions and the
  renderer has an additive viewport-wide fade layer. The smallest evidence
  slice is a reset-owned pre-round snapshot plus renderer/audio selection.

## Decision

Parse `fadein.time`, `fadein.col`, `fadein.anim`, and `fadein.snd`; enrich the
timing model with the resolved AIR action duration; and publish optional
`RuntimePreRound/v0` data containing `RuntimeRoundFade/v0` with
`direction: "in"`. Reset its frame on reset and next-round handoff. Reuse the
existing AIR/SFF renderer, reverse the color fallback opacity for fade-in, and
route the sound through the prefixed FightFX archive with per-round/direction
deduplication.

## Uncertainty and exclusions

This adapter does not claim exact `intro`/`FightScreenRound` frame-start
ordering, timer/input gating, shutter interaction, motif localcoord, dialogue,
skip or `RoundNoSkip`, Common1/ZSS release, team/Turns choreography,
rollback/netplay, or full MUGEN/IKEMEN parity. Those require independent source
and browser gates.

## Verification

- Focused loader/runtime/audio/renderer batch: 4 files / 41 tests passed.
- TypeScript 7.0.2 typecheck passed.
- Grouped suite, build, boundaries, redirect boundary, CSS budget, and
  `633/633` trace gates passed.
- Full browser smoke passed with 64 capture paths, 0 console issues, and 0
  page errors. Diagnostics:
  `.scratch/qa/qa-smoke-t285-full/diagnostics.json`.
