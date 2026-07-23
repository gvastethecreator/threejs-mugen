# T394 ReversalDef Static NumHits

Type: task

Status: resolved in `c8676b20`

## Question

Can static inherited `numhits` reach direct ReversalDef contact and add the
authored count to the countered actor's `ReceivedHits` memory?

## Source evidence

- Pinned [IKEMEN HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
  parses `numhits` as an integer shared by ReversalDef.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L7994)
  delegates inherited fields through HitDef; ModifyReversalDef follows the
  same field path.
- Pinned [IKEMEN contact route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11283-L11300)
  adds `numhits` for absolute hit result one, including reversal contact.

## Contract

Under explicit `ikemen-go`, static ReversalDef and root ModifyReversalDef
carry one integer `numhits` value. Omission uses one for a newly armed
reversal. Direct successful counter contact increments only the countered
actor's state-scoped `ReceivedHits`; it does not create received damage.

## In scope

- Static typed compiler lowering and active mutation.
- Direct counter contact and bounded received-hit memory.
- Unit and imported direct-route proof.

## Out of scope

FightScreen combo display, score, dynamic expressions, Projectile/Helper
routes, teams, exact source timing, rollback/netplay, and full parity.

## Verification

The grouped T394-T396 focal batch passes 6 files / 459 tests, TypeScript 7,
trace-script syntax, and diff hygiene. See
`docs/research/2026-07-23-runtime-numhits-t394-t396-closeout.md`.
