# IKEMEN ModifyReversalDef P2 State Root Redirect Research

Date: 2026-07-22

## Question

Can the local root `ModifyReversalDef RedirectID` path add `p2stateno` without
claiming an explicit `p2getp1state` override?

## Sources

- [Shared HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
- [Shared HitDef mutation runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7631)
- [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)

## Findings

- IKEMEN accepts `p2stateno` and `p2getp1state` as distinct shared HitDef
  fields.
- Writing `p2stateno` also sets `p2getp1state = true` in the shared mutation
  runtime.
- The local reversal apply route already uses `true` for each stored
  `p2StateNo`, then enters the attacker into the reverser's source state.
- Local move and reversal metadata both retain `p2StateNo`; no new ownership
  model is required for this narrow field write.

## Decision

Implement static root-only `p2stateno` under the existing RedirectID contract.
Keep explicit `p2getp1state` unsupported, because its false override needs a
separate source-backed state-transition contract. Reject dynamic, malformed,
empty, unknown, helper, and inactive-reversal routes.

## Evidence plan

- Compiler coverage accepts static `p2stateno` and rejects explicit
  `p2getp1state` plus dynamic input.
- Reversal dispatch coverage proves in-place mutation and fixed true target
  ownership.
- Imported match and required trace prove the attacker enters the receiver's
  modified custom state and records that receiver as state owner.

## Implementation Result

`eddddc8a` adds static `p2stateno` to the typed ModifyReversalDef payload and
updates the active move plus reversal metadata in place. The local reversal
apply route already sends that field through the receiver-owned state branch,
so no new state-transition system was added.

## Verification

Focused compiler, reversal dispatch, active-side-effect, state executor, root
CNS, imported-match, and trace coverage passes 7 files / 1057 tests. The new
required trace ends with P1 in receiver-owned state `889`. Script syntax and
diff hygiene pass. The next grouped runtime checkpoint owns TypeScript, full
Vitest, trace aggregate, build, and boundary evidence.
