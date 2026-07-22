# T384 Root ModifyReversalDef P2 State RedirectID

Type: task

Status: resolved in `eddddc8a`

Blocked by: None

## Question

Can a caller use static `ModifyReversalDef p2stateno` through `RedirectID` to
change an active root reversal's target-owned state route without exposing the
separate `p2getp1state` override?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
  maps `p2stateno` and `p2getp1state` to separate shared HitDef fields.
- Pinned [IKEMEN-GO shared mutation runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7631)
  sets `p2getp1state = true` when it writes `p2stateno`.
- Pinned [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  resolves the active target reversal, then uses shared mutation.

## Local finding

`RuntimeReversalWorld.modify` already mutates one active reversal in place.
`RuntimeReversalWorld.apply` sends any `p2StateNo` through
`enterTargetHitState(attacker, reverser, stateNo, true)`, which matches the
upstream side effect of writing `p2stateno`. The state-transition world already
records the reverser as custom-state owner.

## Candidate contract

Under explicit `ikemen-go`, a static caller-owned RedirectID can patch
`p2stateno` on one verified active root reversal. The receiver keeps move
identity, frame, contact state, control, and telemetry. The resulting counter
routes the attacker into a state defined by the receiver and marks that owner.

## In scope

- Root-to-root active-controller `ModifyReversalDef RedirectID`.
- Static non-negative `p2stateno`.
- In-place move and runtime reversal-state mutation.
- Required imported custom-state trace plus compiler, dispatch, and match
  coverage.

## Out of scope

Explicit `p2getp1state`, `p1stateno`, guard fields, all other shared HitDef
fields, dynamic values, Helpers, teams, source-exact scheduling/hitpause,
custom-state VM breadth, renderer behavior, rollback, score movement, and full
MUGEN/IKEMEN parity.

## Result

The typed operation now accepts static non-negative `p2stateno` with the
existing caller-evaluated RedirectID contract. The active receiver keeps its
move object and reversal metadata object while both store the changed state.
On counter contact, the target enters receiver state `889` with receiver-owned
custom-state metadata. The local fixed true owner behavior matches the upstream
write side effect for `p2stateno`.

## Verification

- Focused compiler, reversal dispatch, active-side-effect, state executor,
  root CNS, imported-match, and trace coverage: 7 files / 1057 tests passed.
- Required `synthetic-imported-ikemen-root-modifyreversaldef-p2state-redirect`
  proves the changed state and receiver owner after counter contact.
- `node --check scripts/qa_traces.cjs` and diff hygiene passed.
- Typecheck, complete Vitest, trace aggregate, build, and boundary checks stay
  queued for the next grouped runtime checkpoint.
