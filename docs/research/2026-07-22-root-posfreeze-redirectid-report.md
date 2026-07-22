# Root PosFreeze RedirectID research

Date: 2026-07-22

Status: implemented, focal verification passed

## Question

What narrow source-backed change lets a root PosFreeze RedirectID retain a
caller-owned dynamic policy through a later root's reset?

## Sources reviewed

- [MUGEN 1.0 PosFreeze reference](https://www.elecbyte.com/mugendocs/sctrls.html#posfreeze)
- Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328),
  [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250),
  and [movement](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9695-L9710).

## Findings

- MUGEN exposes one optional boolean `value`; omitted value freezes the player.
- IKEMEN resolves the destination first, but evaluates `value` in the caller
  before it writes the destination position-freeze flag.
- The port already defers root PosFreeze until a later target has reset and
  preserves the target's captured position after dispatch.
- The port does not materialize a dynamic root PosFreeze operation before
  dispatch, so the destination currently evaluates caller expressions.

## Decision

Use the existing PosFreeze resolver to materialize a typed operation with the
root caller runtime/context when RedirectID is present. Reuse the current root
constraint deferral and preservation hook. Add imported runtime and required
trace evidence with divergent caller/target variables.

## Limits

This work does not prove exact corner-push behavior, source scheduling,
hitpause/reset parity, Helpers, nested ownership, current local false-value
extension semantics, rendering, rollback, upstream differentials, or full
MUGEN/IKEMEN compatibility.

## Implementation and evidence

- `0dfac1ff` materializes root PosFreeze with caller runtime/context before
  redirect dispatch and retains the existing later-root deferral.
- The typed operation carries the local Z policy, so a redirected dynamic value
  does not re-evaluate against the destination while it applies bounds state.
- Imported runtime coverage uses divergent caller/destination variables and
  proves all X/Y/Z freeze axes reach the later root.
- The required trace artifact proves destination freeze state plus typed
  `bounds:posfreeze` and caller VarSet evidence.
- Focused bounds/compiler/Helper/runtime/trace coverage passes `5/5` files /
  `1041/1041` tests. `git diff --check` passed before commit.
- The broad TypeScript, full Vitest, `qa:trace`, build, and boundary batch is
  deferred until more runtime slices accumulate.
