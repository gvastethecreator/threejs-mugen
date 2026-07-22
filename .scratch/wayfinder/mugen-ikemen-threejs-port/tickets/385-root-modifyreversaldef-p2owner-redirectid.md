# T385 Root ModifyReversalDef P2 Owner RedirectID

Type: task

Status: resolved in `32d904a5`

Blocked by: None

## Question

Can a caller use static `ModifyReversalDef p2getp1state` through `RedirectID`
to change an active root reversal's `p2stateno` owner rule without widening the
rest of shared HitDef behavior?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
  maps `p2stateno` and `p2getp1state` independently.
- Pinned [IKEMEN-GO shared mutation runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7634)
  writes `p2stateno` with true ownership, then accepts an explicit boolean
  override for `p2getp1state`.
- Pinned [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  delegates supplied fields to the active reversal after RedirectID resolution.

## Local finding

`RuntimeHitStateTransitionWorld` already chooses the receiver as state owner
for true and the target for false. `DemoMove` also stores `p2GetP1State`; only
the active reversal model and ModifyReversalDef typed operation lack the field.

## Candidate contract

Under explicit `ikemen-go`, static `p2getp1state` can mutate one verified
active root reversal through caller-owned RedirectID. A false value routes the
countered target into its own state data and clears custom-state owner data.

## In scope

- Root-to-root active-controller `ModifyReversalDef RedirectID`.
- Static scalar `p2getp1state` values.
- In-place active move and reversal metadata mutation.
- Required imported trace plus compiler, dispatch, and match coverage for the
target-owned false route.

## Out of scope

`p2stateno` field expansion beyond T384, guard fields, all other shared HitDef
fields, dynamic values, Helpers, teams, source-exact scheduling/hitpause,
custom-state VM breadth, renderer behavior, rollback, score movement, and full
MUGEN/IKEMEN parity.

## Result

The typed operation now accepts static numeric `p2getp1state` values and stores
the normalized boolean on the existing active move and reversal metadata. A
false override keeps move identity and contact state, then sends the countered
target through its own state data. A nonzero value remains receiver-owned.

## Verification

- The shared focused compiler, reversal dispatch, active-side-effect, state
  executor, root CNS, imported-match, and trace run passes 7 files / 1057
  tests.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-p2owner-redirect` evidence
  ends with P1 in its own state `888`, with no custom-state owner, and P2 in
  reversal state `777`.
- `node --check scripts/qa_traces.cjs` and diff hygiene passed.
- Typecheck, complete Vitest, trace aggregate, build, and boundary checks stay
  queued for the next grouped runtime checkpoint.
