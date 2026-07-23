# IKEMEN ReversalDef NumHits Research

Date: 2026-07-23

## Question

How does inherited `numhits` affect a successful ReversalDef contact?

## Authority

Pinned IKEMEN-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- [HitDef numhits compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
- [HitDef reset default](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L764)
- [ReversalDef inherited HitDef delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L7994)
- [ModifyReversalDef inherited HitDef delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8342-L8384)
- [Reversal combo and received-hit update](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11283-L11300)

## Findings

- `numhits` is one integer field in the shared HitDef parameter path used by
  ReversalDef and ModifyReversalDef.
- A fresh upstream HitDef starts with `numhits = 1`.
- The contact code uses `Abs(hitResult) == 1`, so it includes a successful
  reversal result. It adds `hd.numhits` to the countered actor's
  `receivedHits` and to the FightScreen combo counter.
- The local runtime already exposes state-scoped `ReceivedHits`, but its
  damage helper always adds one. A reversal needs a separate received-hit
  update because it does not apply normal HitDef damage.

## Local decision

Lower static scalar `numhits` as `hitCount` on ReversalDef and root
ModifyReversalDef. New reversals use one when the field is absent. On a
successful direct reversal, add that count to the countered actor's
state-scoped `ReceivedHits` memory without changing `ReceivedDamage`.

The local contact counter remains bounded to `0..999`; this is a runtime
safety rule and is narrower than a claim of exact upstream overflow behavior.

## Limits

This cut does not add FightScreen combo display, score handling, dynamic
expressions, Projectile or Helper reversals, team counting, state-timing
parity, or full MUGEN/IKEMEN parity.
