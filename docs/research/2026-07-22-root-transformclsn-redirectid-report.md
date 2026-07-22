# Root TransformClsn RedirectID research

Date: 2026-07-22

Status: implemented, focal verification passed

## Question

What narrow source-backed change lets a root TransformClsn RedirectID retain a
caller-owned dynamic transform through a later root's reset?

## Sources reviewed

Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:

- [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L6724-L6749)
- [runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L14885-L14913)

## Findings

- IKEMEN resolves RedirectID before it evaluates `scale` and `angle`; both
  expressions use the controller caller.
- Scale multiplies destination collision scale and angle adds to destination
  collision angle.
- The port resets collision scale and angle with the current root's one-frame
  constraints, but generic root TransformClsn redirect dispatch does not defer
  a later target.
- Generic dispatch also resolves a dynamic TransformClsn operation in the
  destination runtime unless it first attaches a typed caller operation.

## Decision

Materialize TransformClsn through the existing collision-transform resolver
with the caller runtime/context. Reuse the root constraint deferral queue for a
later destination. Add imported runtime and required trace evidence with
different caller and target variables.

## Limits

This work does not prove precise collision geometry, source scheduling, Helper
routes, nested ownership, hitpause/reset parity, rendering, rollback, upstream
differentials, or full MUGEN/IKEMEN compatibility.

## Implementation and evidence

- `0dfac1ff` materializes root TransformClsn scale and angle in the caller
  before redirected dispatch and includes the controller in later-root
  constraint deferral.
- Imported runtime coverage uses divergent caller/destination variables and
  proves scale and angle survive the destination collision reset.
- The required trace artifact proves destination collision scale/angle plus
  typed `collision-transform` and caller VarSet evidence.
- Focused bounds/compiler/Helper/runtime/trace coverage passes `5/5` files /
  `1041/1041` tests. `git diff --check` passed before commit.
- The broad TypeScript, full Vitest, `qa:trace`, build, and boundary batch is
  deferred until more runtime slices accumulate.
