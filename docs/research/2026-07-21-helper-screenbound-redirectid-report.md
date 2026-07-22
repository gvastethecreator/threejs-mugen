# Helper ScreenBound state and RedirectID research

Date: 2026-07-21

Status: implemented and batch-verified

## Sources reviewed

- [MUGEN 1.1 ScreenBound reference](https://www.elecbyte.com/mugendocs/sctrls.html#screenbound)
- Pinned Ikemen-GO commit
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L3269-L3305)
  and
  [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L10159-L10205).

## Findings

- Pinned Ikemen compiles RedirectID before value, movecamera, and stagebound.
  It defaults omitted value and camera inputs to false.
- Its runtime resolves the destination before the controller body and evaluates
  values in the caller. It sets screen-bound, X/Y camera, and stage-bound
  flags independently on that destination.
- The port's generic dispatcher already has typed static/dynamic ScreenBound
  operation support. Its Helper adapter lacks the controller entry, copied
  runtime fields, one-frame reset, and bounds-operation redirect materializer.
- Current actor constraints already consume screenBound for X clamp and
  stageBound for Z clamp. Helper Depth and Width edge can reuse that state.

## Decision

T369 should add ScreenBound to the current Helper generic dispatch set, retain
screen/stage-bound state in Helper runtime adapters, reset it with existing
per-frame bounds state, and materialize a caller-owned typed bounds operation
before verified Helper RedirectID writeback. Explicit ScreenBound true uses the
current Helper X/Z stage projection; the camera flags remain state evidence
only.

## Deliberate limits

Do not add camera tracking, PosFreeze, exact source screen/stage separation,
source scheduler order, nested Helpers, broad redirect recursion, pause or
hitpause parity, renderer output, upstream differentials, score movement, or
full MUGEN/IKEMEN parity.

## Result

Commits 0f420d44 and ac8283dc add current first-generation Helper ScreenBound
state, typed bounds-operation materialization for RedirectID, helper
snapshot/writeback support, and the partial stage-coordinate contract used by
the existing X/Z projection. Dynamic caller values, StageBound false, next
frame reset, local state, root destination writeback, and invalid redirect
rejection have focused coverage.

The final T368-T369 batch passes 4 focused files and 411 tests, 241 full-suite
files and 2661 tests, TypeScript 7, 636 trace artifacts, both boundary guards,
diff hygiene, and the production build. Camera flags remain state evidence;
this does not claim camera tracking or source scheduler parity.
