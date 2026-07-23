# T396 ModifyHitDef Static NumHits

Type: task

Status: resolved in `c8676b20`

## Question

Can a root ModifyHitDef carry static `numhits` into one active normal HitDef
without resetting its move or accepting a dynamic value?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
  aliases `modifyHitDef` to `hitDef` and delegates every non-RedirectID field
  through `hitDef.runSub` on the active receiver.
- Pinned [IKEMEN HitDef numhits compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
  parses `numhits` as one integer in that shared parameter set.

## Contract

Under explicit `ikemen-go`, static `ModifyHitDef numhits` changes only the
active normal receiver move's hit count. Omitted input keeps the active count;
dynamic or malformed input remains unsupported.

## In scope

- Static typed compiler lowering.
- In-place active normal HitDef mutation through root RedirectID.
- Unit and imported route proof.

## Out of scope

Other inherited fields, dynamic expressions, Projectile and Helper routes,
contact timing, FightScreen combo display, teams, rollback/netplay, and full
parity.

## Verification

The grouped T394-T396 focal batch passes 6 files / 459 tests, TypeScript 7,
trace-script syntax, and diff hygiene. See
`docs/research/2026-07-23-runtime-numhits-t394-t396-closeout.md`.
