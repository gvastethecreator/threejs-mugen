# Root ScreenBound RedirectID research

Date: 2026-07-22

Status: implemented, focal verification passed

## Question

What narrow source-backed change lets a root ScreenBound RedirectID retain
caller-owned dynamic bounds policy through a later root's reset?

## Sources reviewed

- [MUGEN 1.1 ScreenBound reference](https://www.elecbyte.com/mugendocs/sctrls.html#screenbound)
- Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3275-L3308)
  and [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10186-L10224).

## Findings

- IKEMEN resolves the destination first, but every ScreenBound expression
  evaluates in the controller caller before it writes the destination flags.
- The port resolves the redirect identifier in caller context, but generic
  dispatch evaluates a dynamic ScreenBound operation in the destination
  runtime unless it first attaches a typed operation.
- Root frame reset clears `screenBound` and `stageBound` before the target's
  active controllers. The existing root constraint deferral already protects
  PosFreeze, PlayerPush, Width, Height, and Depth, but omits ScreenBound.

## Decision

Materialize ScreenBound from the root caller/runtime context before redirect
dispatch. Treat ScreenBound as a deferred root bounds constraint, reuse the
existing verified resolver, and record the typed operation at the destination.
Add imported runtime and required trace proof for caller-owned dynamic value,
camera, and stage-bound state after a later root reset.

## Limits

This work does not prove helper routes, camera tracking, exact screen/stage
behavior, source scheduling, hitpause, rendering, rollback, upstream
differentials, or full MUGEN/IKEMEN compatibility.

## Implementation and evidence

- `9ff8cf90` adds caller-side ScreenBound materialization to the root active
  controller path and includes ScreenBound in existing later-root constraint
  deferral.
- Imported runtime coverage proves dynamic caller values reach a later root
  after that root resets its one-frame bounds state.
- The required trace artifact proves destination `screenBound`, camera flags,
  typed `bounds:screenbound`, and caller VarSet evidence.
- Focused bounds/compiler/Helper/runtime/trace coverage passes `5/5` files /
  `1036/1036` tests. `git diff --check` passed before commit.
- The broad TypeScript, full Vitest, `qa:trace`, build, and boundary batch is
  deferred until more runtime slices accumulate.
