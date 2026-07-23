# T399 ModifyHitDef Static Target State

Type: task

Status: resolved in `cb21362e`

## Question

Can root ModifyHitDef carry static `p1stateno`, `p2stateno`, and
`p2getp1state` into one active normal HitDef without restarting its move or
accepting dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8345)
  delegates non-RedirectID fields into the active receiver's shared HitDef.
- Pinned [IKEMEN HitDef target-state assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7631)
  assigns `p1stateno`, then `p2stateno`, defaults `p2getp1state` to true,
  and applies an explicit boolean value last.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
active normal move target-state fields. A supplied `p2stateno` defaults its
route to receiver-owned state data; explicit `p2getp1state = 0` selects the
target's own state data. Omitted fields keep the active values. Dynamic or
malformed input remains unsupported.

## In scope

- Typed static compiler lowering.
- In-place normal active HitDef mutation through root RedirectID.
- Unit and imported-route coverage for state data and source order.

## Out of scope

Other inherited fields, dynamic expressions, full source grammar and range
behavior, Projectile and Helper routes, exact contact timing, teams,
rollback/netplay, renderer behavior, and full MUGEN/IKEMEN parity.

## Verification

The grouped compiler, HitDef, direct-combat, CombatResolver, reversal, and
imported-match focal batch passes 6 files / 467 tests. TypeScript 7,
trace-script syntax, and diff hygiene pass. Global Vitest, aggregate traces,
build, and boundary checks remain reserved for the larger checkpoint.
