# Research: FightScreen AIR/SFF announcement renderer

Date: 2026-07-18
Question: What is the smallest source-faithful visual boundary after display
variant indexing?

## Source decision

IKEMEN-GO represents Round and Fight calls as `AnimTextSnd` values backed by an
`AnimLayout`. The loader selects the source `anim` action from the FightScreen
animation table, while the draw path advances the layout animation only after
the round/fight timing boundary. The FightScreen has its own localcoord and SFF
archive, so the browser port must keep that sprite provider separate from
character and FightFX providers.

## Implementation boundary

- `FightScreenAnnouncementRenderer` owns a dedicated screen SFF provider.
- Runtime `roundNo` and announcement `mode` select the display definition.
- Existing AIR frame duration/loop resolution is reused for the selected action.
- `offset`, `scale`, `facing`, `vfacing`, and imported FightScreen localcoord are
  projected into the current camera viewport.
- Missing action/sprite and text-only definitions remain explicit diagnostics;
  the DOM HUD remains the text fallback.

## Open renderer work

Exact source `AnimTextSnd.End` completion, FNT loading/rasterization, palette
effects, top/background layers, screenpack motif inheritance, dialogue, pause
and rollback persistence, and full browser visual parity remain open.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
