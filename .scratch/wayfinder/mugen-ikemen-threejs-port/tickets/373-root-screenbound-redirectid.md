# T373 Root ScreenBound RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root direct dynamic `ScreenBound` policy to a verified later
root, preserve caller-owned `value`, `movecamera`, and `stagebound`, and retain
that policy after the target's one-frame bounds reset?

## Source evidence

- [MUGEN 1.1 ScreenBound reference](https://www.elecbyte.com/mugendocs/sctrls.html#screenbound)
  documents the screen-bound and camera boolean parameters.
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3275-L3308)
  reads `redirectid` before `value`, `movecamera`, and `stagebound`.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10186-L10224)
  resolves the destination before it evaluates each parameter in the caller
  and writes the three flags to that destination.

## Local finding

The root active-controller path recognizes ScreenBound RedirectID, but dynamic
operations are passed directly to the destination runtime. It also defers only
PosFreeze and PlayerPush. A later root consequently resolves caller expressions
against its own state and then clears the redirected bounds policy at reset.

## Quality contract

A verified imported root may redirect static or dynamic ScreenBound policy to
one live root. Dynamic value/camera/stage flags resolve in the caller, a later
target receives the write after its reset, and unavailable destinations fail
closed through the current IKEMEN redirect resolver.

## In scope

- Root-to-root active-controller ScreenBound RedirectID.
- Dynamic `value`, `movecamera`, and `stagebound` in caller context.
- Later-root bounds-reset ordering and typed telemetry/trace proof.

## Out of scope

Helper routes, camera tracking/rendering, exact screen/stage separation,
CharList ordering, hitpause/reset parity, nested ownership, collision geometry,
rollback, upstream differentials, and full MUGEN/IKEMEN parity.

## Result

Root active-controller ScreenBound now materializes dynamic `value`,
`movecamera`, and `stagebound` in the caller before it dispatches to the
verified target. A redirected write to a root that advances later waits until
that root has completed its one-frame constraint reset.

## Verification

- Runtime feature commit: `9ff8cf90`.
- Focused bounds/compiler/Helper/runtime/trace batch: `5/5` files and
  `1036/1036` tests pass.
- `git diff --check` passed before the feature commit.
- TypeScript, full Vitest, trace aggregate, build, and boundary guards remain
  intentionally deferred to the next grouped runtime checkpoint.
