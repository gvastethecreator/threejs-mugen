# T382 Root ModifyReversalDef RedirectID

Type: task

Status: resolved in `0f30280e`

Blocked by: None

## Question

Can one root use static `ModifyReversalDef` `reversal.attr` through
`RedirectID` to patch one verified root's already-active reversal without
reactivating it or claiming the shared IKEMEN HitDef parameter surface?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2331-L2359)
  compiles `redirectid`, reversal attr/guard fields, then the shared HitDef
  parameter set.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  resolves the destination, rejects it without reversal attr, then mutates the
  existing target HitDef. Its active-reversal guard has an upstream TODO, so
  this remains a bounded behavior claim.
- Pinned [IKEMEN-GO redirect resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4843-L4858)
  evaluates RedirectID on the caller and blocks unavailable characters.

## Local finding

Before T382, the scanner recognized `ModifyReversalDef`, but no compiler
operation, active side-effect route, or mutation boundary existed. The existing
`ReversalDef` dispatcher activates a new reversal and clears contact state, so
it cannot model this controller safely.

## Candidate contract

Under explicit `ikemen-go`, a static caller-owned `reversal.attr` and valid
caller-evaluated RedirectID can patch one verified root with an already-active
reversal. The receiver retains move identity, active frame, contact state,
control, reversal timing/state payload, and telemetry. Missing, malformed,
unsupported, inactive, and unknown routes leave it unchanged.

## In scope

- Root-to-root active-controller `ModifyReversalDef RedirectID`.
- Static `reversal.attr` payload only.
- Caller-evaluated RedirectID selection.
- Receiver-owned mutation without ReversalDef reactivation or contact reset.
- Required imported counter trace and fail-closed unit coverage.

## Out of scope

`reversal.guardflag`, `reversal.guardflag.not`, all inherited HitDef fields,
dynamic payloads, Helpers, custom states, Projectile mutation, teams,
source-exact scheduling/hitpause, rollback, renderer behavior, score movement,
and full MUGEN/IKEMEN parity.

## Result

The compiler now admits only `RedirectID` plus static `reversal.attr`. The
active root route resolves the target in caller context and mutates the
receiver's existing reversal in place. It retains move identity, frame,
contact state, and reversal state. Unsupported, inactive, malformed, and
unknown routes do not mutate the receiver.

## Verification

- Focused compiler, reversal dispatch, imported-match, and trace coverage: 7
  files / 1050 tests passed.
- Required `synthetic-imported-ikemen-root-modifyreversaldef-redirect` trace
  proves receiver-owned counter contact after a static redirected mutation.
- `git diff --check` and `node --check scripts/qa_traces.cjs` passed.
- TypeScript, complete Vitest, trace aggregate, build, and boundary checks stay
  queued for the next grouped runtime checkpoint.
