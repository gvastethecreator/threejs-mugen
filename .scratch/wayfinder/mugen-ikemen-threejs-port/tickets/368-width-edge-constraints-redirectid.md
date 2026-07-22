# T368 Width edge constraints and RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can current roots and first-generation Helpers retain a one-frame Width edge
state, including the edge component of Width value, and project it through the
current X-bound path without claiming source camera or scheduler parity?

## Source evidence

MUGEN defines Width edge as the front/back distance that constrains how close a
player can move to the screen edge. Width player controls player contact width,
and Width value is shorthand for both sets. The pinned Ikemen-GO compiler
accepts edge and player together, falls back to value only when neither is
specified, and runtime evaluates values in the caller before applying
destination/caller local-coordinate scale. Its current char code resets edge
width per frame and uses facing-aware edge insets in its screen-bound and
camera paths.

- [MUGEN 1.1 Width reference](https://www.elecbyte.com/mugendocs/sctrls.html#width)
- [Ikemen-GO Width compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L2575-L2611)
- [Ikemen-GO Width runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L9484-L9528)
- [Ikemen-GO Width setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7696-L7717)
- [Ikemen-GO screen-bound use](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9875-L9925)

## Local finding

The current Width operation only carries player width. It discards static
edge, treats value as player-only, and the actor constraint state has no
edge-width field. Current root clamp and participant body-push clamp use stage
bounds, while Helpers only receive the latter when they are current push
participants.

## Quality contract

Artifact and user outcome: a current Width controller can change its player
width, edge width, or both for the current frame, and a verified RedirectID
destination receives scaled caller values without leaking transient edge state
into the next frame.

Mission mode: change.

In scope: typed/static and dynamic Width edge/player/value parsing, one-frame
edge reset, caller-context values, root/current-Helper RedirectID scaling and
writeback, facing-aware X insets in the current constraint/body-push path,
snapshots, and focused proof.

Out of scope: exact screen/camera split, ScreenBound and StageBound behavior,
camera tracking, exact source CharList order, nested Helpers, size proxies,
renderer proof, upstream differentials, rollback/netplay, score movement, and
full MUGEN/IKEMEN parity.

## Evidence target

- Focused compiler and actor-constraint coverage for edge, combined
  edge/player, value shorthand, facing, reset, and destination scale.
- Focused Helper coverage for local and redirected edge state, writeback, and
  current clamp behavior.
- Imported root route for dynamic caller values, RedirectID scale, and current
  stage-bound projection.
- Batch focused tests, TypeScript, traces, build, boundary guards, and diff
  hygiene after the implementation round.

## Result

Commit 42e2fabe stores edge width separately from player width at the shared
constraint boundary. Width edge changes only the current edge pair, Width
player changes only the body pair, and Width value changes both. Root and
first-generation Helper state reset the pair each frame. Current X projection
uses facing-aware edge insets, and verified RedirectID routes retain caller
evaluation, destination local-coordinate scale, destination writeback, and
fail-closed resolution.

## Verification

The combined T368-T369 focused batch passes 4 files and 411 tests. The broader
batch passes 241 files and 2661 tests, TypeScript 7, 636 trace artifacts
(602 required and 34 optional), both boundary guards, diff hygiene, and a
329-module production build. Browser smoke is N/A for this runtime-only batch.

Exact screen/camera separation, source scheduling, nested Helpers, renderer
proof, upstream differentials, score movement, and full parity remain blocked.
