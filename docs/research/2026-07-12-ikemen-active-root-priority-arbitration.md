# IKEMEN Active-root Priority Arbitration Research

Date: 2026-07-12
Wayfinder: 116

## Primary Sources

- Ikemen-GO global hit detection order, pinned SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`: https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931
- Ikemen-GO hit-result and priority handling at the same SHA: https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10488-L10835
- Elecbyte HitDef priority reference: https://www.elecbyte.com/mugendocs/sctrls.html#hitdef

## Decision

Enumerate stable unordered pairs from the already admitted active-root ids. Resolve each pair through the existing direct-combat priority primitive before any admitted direct-hit mutation. Buffer suppression against the exact opposing getter, because scalar `hasHit` would incorrectly close every other opponent in a plural match. Preserve the legacy P1/P2 call when no plural callback exists.

## Bounded Claim

The runtime now covers deterministic unequal and equal bounded Hit-priority arbitration for exercised active-root pairs. It does not claim exact Hit/Miss/Dodge behavior, ReversalDef ordering, or order-independent cyclic arbitration among three or more simultaneous attackers.

## Next Risk

Wayfinder 117 should build an independent oracle for equal-priority trade and ReversalDef ordering, then decide whether the current pairwise primitive can support three-plus-actor cycles without traversal-order effects.
