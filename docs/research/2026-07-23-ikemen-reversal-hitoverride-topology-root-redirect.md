# IKEMEN Reversal HitOverride Topology Research

Date: 2026-07-23

## Question

Which actor owns the HitOverride checked during ReversalDef contact, and which
payload controls that match?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [ReversalDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
- [ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
- [ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
- [Contact and HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10718-L10824)

## Findings

- `reversal.attr` selects which incoming HitDefs a ReversalDef can counter.
  `attr` and `guardflag` remain inherited HitDef fields on that counter.
- At counter contact, IKEMEN searches `getter.hover`. `getter` is the
  original attacking actor that the reversal counters; it is not the
  ReversalDef owner.
- Slot type matching uses the active counter payload `hd.attr`. Slot state
  matching uses the counter owner's current state. Slot guard matching uses
  `hd.guardflag`; the counter owner's unguardable flag rejects positive slot
  guard filters and bypasses negative ones.
- `missonoverride = 1`, or the omitted non-projectile custom-state default,
  returns no contact. With explicit zero, IKEMEN selects the HitOverride
  route. It does not continue through normal ReversalDef p1/p2 states.

## Local decision

Keep the repair narrow and direct:

- Carry static inherited `attr` as `hitDefAttr` and `guardflag` as
  `guardFlag` on typed ReversalDef operations and active runtime metadata.
- Query HitOverride slots on the countered actor, passing the active
  reversal's inherited payload and the reverser's state/unguardable context.
- Reuse the local HitOverride redirect route for explicit zero. Preserve the
  existing direct miss result for the default and forced cases.

## Evidence

`20324cf` adds compiler, runtime, imported-match, and required trace coverage.
The trace uses an incoming `S,NA` / `H` HitDef, a ReversalDef with inherited
`S,SP` / `A`, and an attacker-owned matching slot. It ends in the
HitOverride state `889`; a normal reversal would instead enter the reverser's
state `777`.

## Limits

This covers static direct root contact only. Dynamic expressions, complete
attribute grammar, Projectile/Helper and reversal-clash paths, exact scheduler
ordering, complete HitOverride side effects, renderer work, and full parity
remain open.
