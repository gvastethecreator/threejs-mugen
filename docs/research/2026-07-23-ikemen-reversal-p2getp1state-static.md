# IKEMEN ReversalDef P2GetP1State Research

Date: 2026-07-23

## Question

How does a ReversalDef choose the owner of its `p2stateno` state?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
- [ReversalDef bytecode delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
- [P2 custom-state selection](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10770-L10824)

## Findings

- `ReversalDef` delegates inherited fields to the same HitDef parameter path.
- Setting `p2stateno` sets `p2getp1state` to true before an explicit
  `p2getp1state` parameter can replace it.
- At contact, a true value selects the ReversalDef state owner; false selects
  the countered target's own state data.
- The source accepts a boolean expression. This pass keeps only static
  numeric input and treats zero as false and nonzero as true.

## Local decision

Carry static values through `ReversalDefControllerOp`, activation,
`DemoMove`, and `RuntimeReversalDef`. Keep the existing `true` fallback in
the direct apply route so omitted values retain the prior default.

## Limits

This only proves static direct-root ownership. It does not establish dynamic
evaluation, exact source frame ordering, Helper or Projectile behavior,
HitOverride interaction breadth, or full parity.
