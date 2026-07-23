# IKEMEN HitDef IgnoreReversalDef Research

Date: 2026-07-23

## Question

Which active HitDef controls whether ReversalDef may counter it?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [HitDef compiler parameter](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2267-L2270)
- [HitDef bytecode storage](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7920-L7922)
- [ReversalDef attribute admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10445-L10472)

## Findings

- `ignorereversaldef` belongs to the active HitDef being countered, not to
  the ReversalDef.
- The source checks it before validating the countered HitDef attr and guard
  details for a ReversalDef.
- The flag is part of a reset HitDef payload, so a later HitDef that omits it
  returns to the default false value.

## Local decision

Carry static values from `HitDefControllerOp` into `DemoMove`. Gate the
direct reversal lookup and the equal-priority direct preflight on that move
field. Keep projectile and reversal-clash routes out of this small pass.

## Limits

This does not implement dynamic expression evaluation or prove the complete
source scheduler. It only covers current direct root/helper-compatible
HitDef paths that reuse `RuntimeCombatResolutionWorld`.
