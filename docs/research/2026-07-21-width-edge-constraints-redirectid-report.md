# Width edge constraints and RedirectID research

Date: 2026-07-21

Status: implemented and batch-verified

## Sources reviewed

- [MUGEN 1.1 Width reference](https://www.elecbyte.com/mugendocs/sctrls.html#width)
- Pinned Ikemen-GO commit
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L2575-L2611),
  [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9484-L9528),
  [setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7696-L7717),
  and
  [screen-bound use](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9875-L9925).

## Findings

- MUGEN states that Width edge changes the front/back distance to the screen
  edge, Width player changes player contact width, and Width value sets both.
- The pinned Ikemen compiler accepts edge and player independently. If either
  appears, value is not used. The runtime resolves RedirectID before
  evaluating caller expressions and applies the destination/caller localcoord
  ratio to every active pair.
- Pinned Ikemen runtime stores edge width separately from player width,
  clears it every frame, and uses facing to swap front/back insets before its
  screen-bound and camera calculations.
- This port already has one-frame player Width, RedirectID scale, root reset
  deferral, and Helper lease/writeback. It lacks edge state and only has one
  current stage X-bound surface.

## Decision

T368 should keep player and edge values separate in the typed Width operation,
apply value to both, reset edge state with existing size constraints, and
apply verified RedirectID scale once at the shared actor constraint boundary.
The current X-bound and body-push clamp will use facing-aware insets. This is
only a bounded stage projection; it does not claim the source screen/camera
split.

## Deliberate limits

Do not add camera tracking, exact ScreenBound or StageBound behavior, source
CharList scheduling, nested Helpers, size proxies, renderer output, upstream
differential proof, score movement, or full MUGEN/IKEMEN parity.

## Result

Commit 42e2fabe adds separate one-frame edge state to current root and
first-generation Helper Width handling. Edge, player, and value retain their
distinct current meanings, while value updates both pairs. Current X clamp
uses facing-aware insets. RedirectID values still evaluate in the caller and
scale once for the verified destination.

The final T368-T369 batch passes 4 focused files and 411 tests, 241 full-suite
files and 2661 tests, TypeScript 7, 636 trace artifacts, both boundary guards,
diff hygiene, and the production build. The result does not establish source
camera or scheduler parity.
