# T370 Helper PosFreeze and RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can a current first-generation IKEMEN Helper execute `PosFreeze` locally or
through a verified `RedirectID`, preserve the selected actor's current-tick
position, and keep the existing one-frame bounds reset contract?

## Source evidence

- [MUGEN 1.0 PosFreeze reference](https://www.elecbyte.com/mugendocs/sctrls.html#posfreeze)
  defines optional `value`, defaults it to `1`, and freezes the player's
  position while it is non-zero.
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328)
  reads `redirectid` before `value` and supplies `value = 1` when absent.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250)
  resolves the destination before the controller body, evaluates `value` in
  the caller, and sets the destination position-freeze flag only when true.
- Pinned [IKEMEN-GO movement](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9690-L9712)
  restores X from the old position while retaining corner push; otherwise it
  advances X, Y, and Z velocity.

## Local finding

The typed bounds dispatcher already executes root `PosFreeze`, and current
constraints can restore a captured X/Y/Z start position. Helpers do not retain
`posFreeze`, reject the controller before generic dispatch, do not capture a
start position, and cannot materialize a typed PosFreeze operation for their
resource RedirectID path. Static compiler operations also omit RedirectID even
though the pinned IKEMEN compiler supports it.

## Quality contract

Artifact and user outcome: an eligible Helper freezes its own current-tick
motion when `value` is true. A verified Helper RedirectID uses caller-owned
values, writes only the selected actor, and restores a target that has already
advanced in the current actor order. A later Helper target retains the current
tick's freeze through its frame reset.

## In scope

- Static and dynamic `value` with the existing local axis extension retained.
- Helper state, snapshot/writeback, per-frame reset, and captured X/Y/Z start.
- Static typed RedirectID, dynamic materialization, verified resource lease,
  caller evaluation, and fail-closed resolution.
- Current actor-order restoration for redirected Helper/root destinations.
- Focused compiler, Helper, and imported match proof.

## Out of scope

Exact IKEMEN corner-push behavior, camera behavior, pause/hitpause order,
nested Helpers, recursive redirects, spawned-this-tick helper starts,
upstream differential runs, renderer proof, rollback, and full parity.

## Result

Commit `6bbeb6f7` adds one-frame PosFreeze state to current
first-generation Helpers. Static compiler operations now retain `RedirectID`;
generic Helper dispatch resolves static and dynamic value expressions in the
caller, materializes the typed bounds operation, and writes it through the
existing verified resource lease. A later Helper target retains a current-tick
freeze through its reset. Root and already-advanced Helper destinations restore
their captured match-frame positions after redirected dispatch.

The current bounds resolver also clears all PosFreeze axes, including Z, when
an explicit `value = 0` resolves false.

## Verification

Focused compiler, bounds, Helper, and imported match coverage passes 4 files
and 407 tests. The required
`synthetic-imported-ikemen-helper-posfreeze-redirect` trace passes its focused
gate and proves a Helper-to-root RedirectID route with typed
`bounds:posfreeze` telemetry and target freeze state.

The broader typecheck, full suite, trace aggregate, build, and boundary batch
is deliberately deferred until several runtime slices accumulate. Browser
smoke is N/A for this runtime-only change.
