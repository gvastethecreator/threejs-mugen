# IKEMEN ModifyHitDef NumHits Research

Date: 2026-07-23

## Question

Does `ModifyHitDef` update the active HitDef `numhits` field?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [ModifyHitDef shared HitDef delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
- [HitDef numhits compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)

## Findings

- Upstream defines `modifyHitDef` from the shared `hitDef` type.
- It rejects a receiver with no active normal HitDef, then sends each non-
  RedirectID parameter to `hitDef.runSub` for that receiver.
- `numhits` is an integer parameter in the shared HitDef compiler path.

## Local decision

Lower only a static scalar `numhits` as `hitCount` on the typed operation.
When present, it updates the active normal move's `hitVars.hitCount` in place.
When absent, the current value stays intact. Dynamic and malformed values stay
unsupported because this typed slice has no expression-evaluation contract.

## Limits

This cut does not add other ModifyHitDef fields, dynamic expressions,
Projectile or Helper receivers, contact-timing parity, FightScreen combo
display, team behavior, rollback/netplay, or full MUGEN/IKEMEN parity.
