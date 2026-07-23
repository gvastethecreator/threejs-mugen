# IKEMEN ModifyHitDef Contact Filters Research

Date: 2026-07-23

## Question

Does ModifyHitDef change an active HitDef's attribute, guard, and target
filter fields?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
- [Shared HitDef attr, guardflag, and hitflag assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7540-L7547)

## Findings

- Upstream ModifyHitDef delegates every non-RedirectID field to `hitDef.runSub`
  on the active normal receiver.
- The shared runtime assigns `attr`, `guardflag`, and `hitflag` directly to
  that active HitDef.
- The local active move already owns equivalent `attr`, `guardFlag`, and
  `hitFlag` fields used by direct contact admission.

## Local decision

Lower only static literals for these fields. A root ModifyHitDef writes only
the supplied values onto one active normal receiver and preserves current move
identity, contact state, and omitted filter fields. Dynamic and malformed
input remains unsupported until expression evaluation has its own contract.

## Limits

This cut does not implement all shared fields, full source grammar, dynamic
expressions, Projectile or Helper mutation, exact timing, teams,
rollback/netplay, renderer behavior, or full MUGEN/IKEMEN parity.
