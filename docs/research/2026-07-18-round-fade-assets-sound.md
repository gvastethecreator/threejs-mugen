# Research: FightScreen fade animation and sound assets

Date: 2026-07-18
Ticket: [T284](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/284-round-fade-assets-sound.md)

## Question

Which source-backed part of the FightScreen fade asset contract can be added
after the bounded T282 color fade without coupling the runtime core to motif,
dialogue, or complete release choreography?

## Primary sources

- [Pinned IKEMEN-GO fade reader](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3398-L3420): reads `fadeout.time`, `fadeout.col`, `fadeout.snd`, and `fadeout.anim`; the animation is resolved against the FightFX animation table.
- [Pinned IKEMEN-GO round-state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268): starts the fade at the terminal boundary and advances its state independently from actor sound events.
- Local source: `.scratch/external/Ikemen-GO/src/rect.go`, `Fade.duration`, `Fade.init`, `Fade.step`, and `Fade.draw`.
- Local source: `.scratch/external/Ikemen-GO/src/fightscreen.go`, `readLbFade` and `overTime`.

## Local findings

- T277 already parsed imported round timing and T282 already carried color and
  duration through `RuntimeRoundFade/v0`.
- The local FightFX loader already exposes normalized AIR actions and the
  existing `SpriteProvider`/`TextureStore` path can resolve their SFF sprites.
- The source `Fade` object treats animation length as part of duration. When
  the animation is longer than the color fade, it delays the color layer; when
  an animation exists, `colorFadeTime` returns zero for the animation-backed
  presentation.
- The source step plays the configured sound at fade start. A local global
  snapshot event is preferable to inventing a synthetic actor owner.
- The local renderer has a viewport-wide overlay order and the audio system
  already has a prefixed FightFX archive path, so the bounded asset bridge can
  remain additive.

## Decision

Parse `fadeout.anim` and `fadeout.snd`, enrich the imported timing with the
resolved AIR action duration, and add optional animation/sound references to
the existing round-fade snapshot. Render the AIR frame through FightFX SFF
assets when it resolves, otherwise preserve a visible color fallback and an
explicit diagnostic. Route the global sound through the prefixed FightFX
archive with one-shot deduplication.

## Uncertainty and exclusions

The local bridge does not claim exact FightScreen localcoord behavior for all
screenpack/motif configurations, complete fade-in ownership, exact frame-start
ordering, pause/skip semantics, dialogue, Common1/ZSS execution, team/Turns
release, rollback/netplay, or full parity. Those require separate source and
browser gates.

## Verification

- Focused loader/runtime/audio/renderer batch: 4 files / 38 tests passed.
- TypeScript 7.0.2 typecheck passed.
- Grouped suite, build, boundaries, redirect boundary, CSS budget, and 633/633
  trace gates passed.
- Full browser smoke passed with 64 capture paths, 0 console issues, and 0
  page errors. Diagnostics:
  `.scratch/qa/qa-smoke-t284-full/diagnostics.json`.
