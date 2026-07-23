# IKEMEN ReversalDef P2Facing Research

Date: 2026-07-23

## Question

How does a ReversalDef choose the countered target's facing?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [HitDef facing compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1965-L1988)
- [ReversalDef inherited HitDef delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L7994)
- [ModifyReversalDef inherited HitDef delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8342-L8384)
- [Contact facing assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11474-L11490)
- [Deferred facing application](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11872-L11874)

## Findings

- `p2facing` is an integer inherited HitDef field, so ReversalDef and
  ModifyReversalDef reach it through their HitDef delegation.
- Reversal contact has a negative result. The prior `p1facing` and
  `p1getp2facing` precompute branch only runs for a positive direct hit, so
  it does not add a ReversalDef-facing result in this source route.
- For an absolute result of one, a negative `p2facing` writes the target's
  pending facing to `byf`; a positive value writes `-byf`; zero leaves it
  unchanged. In a direct ReversalDef, `byf` remains the reverser's facing.
- IKEMEN later calls `setFacing` from that pending field. The local runtime
  applies the same sign result during reversal application after target-state
  routing. Its exact frame and hitpause order remain outside this cut.

## Local decision

Carry static integer `p2facing` through `ReversalDefControllerOp`,
`ModifyReversalDefControllerOp`, activation, `DemoMove`, and
`RuntimeReversalDef`. Apply only the documented sign behavior to the
countered direct actor. Keep zero as an authored operation value so an active
root mutation can deliberately clear a prior facing effect.

## Limits

This proves static direct root behavior only. It does not establish dynamic
expression evaluation, the source deferred-update order, `p1facing`,
`p1getp2facing`, Helper or Projectile behavior, clash scheduling, teams, or
full runtime parity.
