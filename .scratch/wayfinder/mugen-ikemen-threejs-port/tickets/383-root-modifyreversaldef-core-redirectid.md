# T383 Root ModifyReversalDef Core RedirectID

Type: task

Status: resolved in `739ac163`

Blocked by: None

## Question

Can one root use static `ModifyReversalDef` fields through `RedirectID` to
patch the core ReversalDef payload already represented by the local runtime,
without rearming the receiver or widening to unmodeled HitDef behavior?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2331-L2359)
  routes `ModifyReversalDef` through reversal fields and the shared HitDef
  parameter decoder.
- Pinned [shared HitDef decoder](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
  accepts state and id fields; it also reads
  [`pausetime`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2041-L2044)
  and [`attack.depth`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2243-L2246).
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  delegates supplied fields to the active reversal HitDef after RedirectID
  resolution.

## Local finding

T382 preserves the receiver and changes `reversal.attr` in place. The local
ReversalDef model already holds `hitPause`, `p1StateNo`, `targetId`, and
`attackDepth`; its runtime reversal state also retains every field except the
target id. `p2stateno` has a local get-P1-state gap, so it cannot join this
cut.

## Candidate contract

Under explicit `ikemen-go`, a static caller-owned RedirectID can patch one
verified root's active reversal with any supplied subset of `reversal.attr`,
the first local `pausetime` value, `p1stateno`, `id`, and `attack.depth`.
The receiver keeps move identity, frame, contact state, control, and telemetry.
Missing, malformed, dynamic, inactive, unknown, helper, and custom-state routes
stay blocked.

## In scope

- Root-to-root active-controller `ModifyReversalDef RedirectID`.
- Static `reversal.attr`, `pausetime`, `p1stateno`, `id`, and `attack.depth`.
- In-place mutation of local move and reversal state where that state stores
  the field.
- Required imported counter trace plus compiler, dispatch, and match coverage.

## Out of scope

`p2stateno`, `p2getp1state`, guard fields, all other shared HitDef fields,
dynamic payloads, Helpers, custom states, Projectile mutation, teams,
source-exact scheduling and hitpause, rollback, renderer behavior, score
movement, and full MUGEN/IKEMEN parity.

## Result

The typed operation now accepts a static subset of `reversal.attr`, one or two
static `pausetime` numbers while retaining the first local value, `p1stateno`,
`id`, and `attack.depth`. It requires RedirectID and one supplied field. The
root route resolves the caller expression, then mutates the verified receiver
in place. Move and reversal objects, contact state, frame, control, and
telemetry remain intact; the target id remains move metadata only.

## Verification

- Focused compiler, reversal dispatch, imported-match, and trace coverage: 7
  files / 1051 tests passed.
- Required `synthetic-imported-ikemen-root-modifyreversaldef-core-redirect`
  proves a widened attack-depth payload admits counter contact, then the
  receiver enters changed `p1stateno` and records changed `id`.
- `git diff --check` and `node --check scripts/qa_traces.cjs` passed.
- The grouped TypeScript, full Vitest, trace aggregate, build, and boundary
  checkpoint follows this feature batch.
