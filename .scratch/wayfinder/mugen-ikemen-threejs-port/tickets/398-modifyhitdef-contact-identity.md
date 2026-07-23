# T398 ModifyHitDef Static Contact Identity

Type: task

Status: resolved in `3239e0f0`

## Question

Can root ModifyHitDef carry static `id` and `chainid` into one active normal
HitDef without resetting its move or accepting dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
  delegates non-RedirectID values to the active receiver's HitDef.
- Pinned [IKEMEN HitDef identity mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7569-L7572)
  updates active `id` and `chainid` through that shared path.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
active normal move contact identity. Omitted fields keep their current values;
dynamic or malformed values remain unsupported.

## In scope

- Typed static compiler lowering.
- In-place normal active HitDef mutation through root RedirectID.
- Unit and imported route proof.

## Out of scope

Other inherited fields, dynamic expressions, full source range and grammar
parity, Projectile and Helper routes, exact timing, teams, rollback/netplay,
renderer behavior, and full MUGEN/IKEMEN parity.

## Verification

The grouped T397-T398 focal batch passes 6 files / 467 tests, TypeScript 7,
trace-script syntax, and diff hygiene. See
`docs/research/2026-07-23-runtime-modifyhitdef-fields-t397-t398-closeout.md`.
