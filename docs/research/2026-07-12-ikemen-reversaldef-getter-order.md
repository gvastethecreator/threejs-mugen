# IKEMEN ReversalDef Getter Ordering Research

Date: 2026-07-12

## Sources

- Ikemen-GO pinned source `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/char.go`: global collision candidates sort ReversalDef before HitDef and then by player id; the outer call passes the sorted actor as `getter` to `hitDetectionPlayer`.
- [Pinned `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931)
- [Elecbyte ReversalDef controller reference](https://www.elecbyte.com/mugendocs/sctrls.html#reversaldef)

## Decision

The local plural direct-contact pass must traverse sorted getters first, then candidate attackers. A separate attacker ordering remains valid for pairwise HitDef priority arbitration but cannot own mutation order. Active-motion roots must be able to author `reversaldef` before admission.

## Evidence Contract

A five-root explicit Tag trace places P4 ReversalDef against P5 HitDef while P2 also attacks P5. Required admission places `p5->p4` before `p2->p5`; runtime evidence must record P4 reversing P5. Attacker-first mutation would let P2 interrupt P5 first and lose the reversal, so the trace distinguishes the two implementations.

## Limits

This slice does not establish ReversalDef-versus-ReversalDef exact ordering/randomness, projectile reflection or removal, Helper routes, throws, attack depth/Z, AffectTeam, broad guard/custom-state interaction, or full IKEMEN parity.
