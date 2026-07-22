# T381 Root ModifyHitDef RedirectID

Type: task

Status: resolved in `86cf7040`

Blocked by: None

## Question

Can one root use a static `ModifyHitDef` payload through `RedirectID` to patch
one verified root's already-active normal HitDef without restarting it or
claiming the full IKEMEN parameter surface?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2286-L2294)
  accepts `redirectid` then compiles the shared HitDef parameter set.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8347)
  resolves the destination, rejects no-active or reversal HitDefs, and applies
  supplied parameters to the existing destination HitDef using caller context.
- Pinned [IKEMEN-GO redirect resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4843-L4858)
  evaluates RedirectID on the caller and blocks unavailable characters.

## Local finding

Before T381, `ModifyHitDef` was listed by the scanner but had no compiler
support, typed operation, active side-effect route, or runtime mutation
boundary. The existing HitDef dispatcher creates a new move and clears contact
state, so it could not model a modification safely.

## Candidate contract

Under explicit `ikemen-go`, a static caller-owned `damage` pair and valid
caller-evaluated RedirectID can patch an existing normal HitDef on one
verified root. The receiver retains its active frame, contact memory, control,
and normal-HitDef identity. Missing, reversal, malformed, dynamic, and unknown
routes leave the destination unchanged.

## In scope

- Root-to-root active-controller `ModifyHitDef RedirectID`.
- Static `damage` payload only.
- Caller-evaluated RedirectID selection.
- Receiver-owned mutation without HitDef reactivation or contact reset.
- Required imported contact trace and fail-closed unit coverage.

## Out of scope

Other ModifyHitDef fields, dynamic payloads, ModifyReversalDef, Helpers,
custom states, Projectile mutation, teams, source-exact scheduling/hitpause,
rollback, renderer behavior, score movement, and full MUGEN/IKEMEN parity.

## Result

The compiler now admits only `RedirectID` plus one static `damage` value or
pair. The active root route resolves the target in caller context and mutates
the receiver's existing normal HitDef in place. It retains move identity,
current frame, contact memory, and control. Missing, reversal, malformed,
dynamic, unsupported, and unknown routes do not mutate the receiver.

## Verification

- Focused compiler, dispatch, imported-match, and trace coverage: 7 files /
  1054 tests passed.
- Required `synthetic-imported-ikemen-root-modifyhitdef-redirect` trace now
  proves receiver-owned contact after a static redirected mutation.
- `git diff --check` and `node --check scripts/qa_traces.cjs` passed.
- TypeScript, complete Vitest, trace aggregate, build, and boundary checks stay
  queued for the next grouped runtime checkpoint.
