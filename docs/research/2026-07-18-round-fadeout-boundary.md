# Research: Imported round fade-out boundary

Date: 2026-07-18
Ticket: [T282](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/282-round-fadeout-boundary.md)

## Question

Which part of the IKEMEN round fade contract can be carried into the local
Three.js runtime without pretending to implement motif, dialogue, or release
state parity?

## Primary sources

- [Pinned IKEMEN-GO post-round step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268): computes the round fade start from `over.waittime`, effective `over.time`, and fade duration, then starts the fade before the next screen.
- [Pinned IKEMEN-GO round-over predicate](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1747-L1751): terminal release uses `over.waittime + overTime()`.
- [Pinned IKEMEN-GO fight-screen parser](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3290-L3315): clamps `over.*` timing values and reads the round configuration.
- [Pinned IKEMEN-GO fade reader and effective duration](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3398-L3420): reads `fadeout.time`/`fadeout.col` and defines `overTime()` as the maximum of authored `over.time` and fade duration.

## Local findings

- The loader already parsed `over.waittime`, `over.hittime`, `over.wintime`,
  `over.forcewintime`, and `over.time`, but no fade fields.
- `RuntimeRoundSystem` owns the post-round clock and already keeps the terminal
  snapshot alive through `remaining = 0`; no new match-owner was needed.
- `ThreeMugenRenderer` already owns viewport-wide pause and environment overlays,
  so a round fade can be a renderer-only presentation layer over the same camera.

## Decision

Add `fadeOutTime` and `fadeOutColor` to imported fight-screen timing. When the
source timing is present, normalize the terminal duration to
`waittime + max(over.time, fadeout.time)`. Publish an additive
`RuntimeRoundFade/v0` record from the existing post-round snapshot. The
renderer uses the final configured fade frames, the authored RGB color, and a
clamped opacity. Preserve explicit normalized `postKoFrames` overrides and
source-less demo behavior.

## Uncertainty

The local runtime does not yet carry the fight-screen fade animation/sound
assets, exact IKEMEN `intro` frame-start ordering, motif fade policy, match-end
dialogue hold, skip input, or `RoundNoSkip`. Those remain separate gates.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/MugenSystemAssetsLoader.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/ThreeMugenRenderer.test.ts`: 4 files / 290 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `git diff --check`: passed for the implementation slice before commit.
