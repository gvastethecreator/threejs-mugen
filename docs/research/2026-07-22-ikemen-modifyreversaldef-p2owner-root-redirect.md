# IKEMEN ModifyReversalDef P2 Owner Root Redirect Research

Date: 2026-07-22

## Question

Can static `ModifyReversalDef p2getp1state` use the local target-owned
state-transition branch through RedirectID?

## Sources

- [Shared HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
- [Shared HitDef mutation runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7634)
- [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)

## Findings

- IKEMEN decodes `p2getp1state` independently after its implicit true write
  from `p2stateno`.
- The local target-state transition already uses `false` to select target state
  data and clear prior custom-state ownership.
- `DemoMove` carries `p2GetP1State`; the active reversal state and typed
  ModifyReversalDef operation can store the same bit without a new route.

## Decision

Implement static root-only `p2getp1state`. It may modify an existing stored
`p2stateno` route. Reject dynamic, malformed, empty, unknown, helper, and
inactive-reversal paths. A false value must prove target-owned state entry.

## Evidence plan

- Compiler accepts static zero/nonzero values and rejects dynamic input.
- Reversal dispatch retains move identity and passes false to the state hook.
- Imported match and required trace prove state `888` comes from the countered
  target, with no custom-state owner.

## Implementation Result

`32d904a5` adds the static `p2getp1state` payload to the typed
ModifyReversalDef operation and active reversal metadata. The reversal apply
path now uses the stored bit, defaulting to the existing true rule when no
explicit override exists. The change keeps the T384 `p2stateno` route intact.

## Verification

The shared focused runtime batch passes 7 files / 1057 tests. The required
trace ends with the countered P1 in its own state `888`, no custom-state owner,
and P2 in reversal state `777`. Script syntax and diff hygiene pass. The next
grouped runtime checkpoint owns TypeScript, full Vitest, trace aggregate, build,
and boundary evidence.
