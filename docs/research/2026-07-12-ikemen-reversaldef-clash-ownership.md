# IKEMEN ReversalDef Clash Ownership Research

Date: 2026-07-12

## Primary Source

- Ikemen-GO pinned SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/char.go` lines 13208-13342 and 13886-13926.
- [Pinned player hit detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13208-L13342)
- [Pinned collision ordering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13926)

## Oracle

IKEMEN sorts outer `getter` calls by active ReversalDef, active HitDef, then id. Inside each getter call it iterates `runOrder` attackers with nonzero `atktmp`. Reversal-specific Z depth compares attack depth against attack depth; Clsn1 contact and `hitResultCheck` precede mutation. A successful attacker-owned ReversalDef marks the getter reversed and neutralizes the getter HitDef.

This is not equivalent to the local ordinary direct pair. Local `resolveDirect(attacker, defender)` rejects `attacker.currentMove.isReversal`, then asks whether the defender owns a counter against an incoming non-reversal move. Blindly admitting reversal actors through that API would swap the source/target meaning and apply the wrong target/state ownership.

## Selected Wayfinder 121

Add a read-only directed ReversalDef-clash projection beside ordinary admitted direct pairs. It must:

1. Preserve getter order by active ReversalDef and PlayerNo.
2. Inspect enemy reversal attackers in stable runtime order.
3. Require both active reversal moves, matching authored reversal attr against the candidate getter attack attr, and Clsn1-to-Clsn1 contact.
4. Emit explicit directed pair/reason diagnostics only.
5. Perform no reversal, target, contact-memory, state, hitpause, power, or move mutation.

Only after a required trace distinguishes the directed candidate order should a dedicated mutation primitive be selected.

## Blocked Claims

No winner, tie, randomness, state-routing, target-memory, projectile/helper, attack-depth/Z, AffectTeam, guard/HitOverride, or full-parity claim is allowed from this research slice.
