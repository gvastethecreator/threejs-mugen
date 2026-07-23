# IKEMEN ModifyHitDef Contact Identity Research

Date: 2026-07-23

## Question

Does ModifyHitDef change the active HitDef `id` and `chainid` fields?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
- [Shared HitDef id and chainid assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7569-L7572)

## Findings

- Upstream sends ModifyHitDef values to the active receiver's shared HitDef.
- That shared path stores a nonnegative `id` and an integer `chainid`.
- The local active move represents these values as `targetId` and
  `hitVars.hitId` / `hitVars.chainId`, which already feed direct contact data.

## Local decision

Lower static scalar values only. Clamp a supplied ID to the local nonnegative
integer boundary, truncate a supplied chain ID, and mutate both local forms of
the active ID together. Omitted values retain current active metadata.

## Limits

This cut does not define full source overflow or range behavior, nochainid,
other fields, dynamic expressions, Projectile or Helper routes, exact timing,
teams, rollback/netplay, renderer behavior, or full MUGEN/IKEMEN parity.
