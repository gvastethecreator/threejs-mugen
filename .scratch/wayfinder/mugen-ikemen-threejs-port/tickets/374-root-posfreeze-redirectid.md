# T374 Root PosFreeze RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root direct dynamic `PosFreeze` policy to a verified later root,
evaluate `value` in the caller, and retain that policy through the target's
one-frame bounds reset?

## Source evidence

- [MUGEN 1.0 PosFreeze reference](https://www.elecbyte.com/mugendocs/sctrls.html#posfreeze)
  defines optional boolean `value`, defaults it to `1`, and freezes the player
  when it is non-zero.
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328)
  reads `redirectid` before `value` and supplies `value = 1` when absent.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250)
  resolves the destination first, evaluates `value` with the controller caller,
  and sets that destination's position-freeze flag when the result is true.
- Pinned [IKEMEN-GO movement](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9695-L9710)
  uses the old X position while retaining corner push when PosFreeze is set.

## Local finding

The generic root active-controller path already defers redirected PosFreeze
writes until a later root resets its one-frame constraints. Unlike PlayerPush
and ScreenBound, it still passes a dynamic controller directly to the target
runtime, so `value = var(0)` resolves against the target rather than caller.

## Quality contract

A verified imported root may redirect static or dynamic PosFreeze policy to one
live root. Dynamic `value` resolves in caller context, a later target receives
the write after its reset, unavailable destinations fail closed through the
current resolver, and the existing local X/Y/Z extension remains unchanged.

## In scope

- Root-to-root active-controller PosFreeze RedirectID.
- Dynamic caller `value` materialization with existing typed bounds dispatch.
- Current later-root reset deferral, preservation hook, telemetry, and trace
  proof.

## Out of scope

Exact IKEMEN corner-push behavior, source scheduling, hitpause/reset parity,
Helper routes, nested ownership, explicit false semantics beyond the current
local extension, rendering, rollback, upstream differentials, and full parity.

## Result

Root active-controller PosFreeze now materializes dynamic caller `value` before
redirect dispatch. The typed operation also carries local Z policy so a target
does not re-evaluate caller `value` while it applies the existing bounds route.
The existing later-root deferral and captured-position preservation hooks remain
the ordering boundary.

## Verification

- Runtime feature commit: `0dfac1ff`.
- Focused bounds/compiler/Helper/runtime/trace batch: `5/5` files and
  `1041/1041` tests pass.
- `git diff --check` passed before the feature commit.
- TypeScript, full Vitest, trace aggregate, build, and boundary guards remain
  intentionally deferred to the next grouped runtime checkpoint.
