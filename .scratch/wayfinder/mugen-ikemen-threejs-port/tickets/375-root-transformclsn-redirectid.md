# T375 Root TransformClsn RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root direct dynamic `TransformClsn` scale and angle to a verified
later root, preserve caller evaluation, and retain the transform through the
target's one-frame collision reset?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L6724-L6749)
  reads `redirectid` before expression-capable `scale` and `angle`.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L14885-L14913)
  resolves the target first, evaluates scale and angle in the caller, and
  multiplies/adds the destination transform state.

## Local finding

The root active-controller path recognizes TransformClsn RedirectID, but sends
a dynamic controller directly to the destination runtime. It also does not
defer a later target even though current root reset clears collision scale and
angle before controller dispatch.

## Quality contract

A verified imported root may redirect static or dynamic TransformClsn scale and
angle to one live root. Expressions resolve in caller context, a later target
receives the transform after its one-frame reset, and unavailable destinations
fail closed through the current IKEMEN redirect resolver.

## In scope

- Root-to-root active-controller TransformClsn RedirectID.
- Dynamic `scale` and `angle` materialization in caller context.
- Later-root collision-transform reset ordering and typed telemetry/trace
  proof.

## Out of scope

Collision geometry precision, source scheduler order, Helper routes, nested
ownership, hitpause/reset parity, renderer output, rollback, upstream
differentials, and full MUGEN/IKEMEN parity.

## Result

Root active-controller TransformClsn now materializes dynamic caller `scale`
and `angle` before verified target dispatch. A write to a root that advances
later waits until that root clears its one-frame collision transform.

## Verification

- Runtime feature commit: `0dfac1ff`.
- Focused bounds/compiler/Helper/runtime/trace batch: `5/5` files and
  `1041/1041` tests pass.
- `git diff --check` passed before the feature commit.
- TypeScript, full Vitest, trace aggregate, build, and boundary guards remain
  intentionally deferred to the next grouped runtime checkpoint.
