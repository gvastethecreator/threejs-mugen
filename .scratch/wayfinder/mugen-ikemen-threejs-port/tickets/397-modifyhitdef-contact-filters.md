# T397 ModifyHitDef Static Contact Filters

Type: task

Status: resolved in `3239e0f0`

## Question

Can root ModifyHitDef carry static `attr`, `guardflag`, and `hitflag` into one
active normal HitDef without resetting the move or accepting dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8340)
  delegates non-RedirectID values to the active receiver's HitDef.
- Pinned [IKEMEN HitDef field mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7540-L7547)
  assigns `attr`, `guardflag`, and `hitflag` through the shared HitDef path.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
active normal move contact filters. Omitted fields keep their current values;
dynamic or malformed values remain unsupported.

## In scope

- Typed compiler lowering for static literal filters.
- In-place normal active HitDef mutation through root RedirectID.
- Unit and imported route proof.

## Out of scope

Other inherited fields, dynamic expressions, Projectile and Helper routes,
full grammar parity, exact contact timing, teams, rollback/netplay, renderer
behavior, and full MUGEN/IKEMEN parity.

## Verification

The grouped T397-T398 focal batch passes 6 files / 467 tests, TypeScript 7,
trace-script syntax, and diff hygiene. See
`docs/research/2026-07-23-runtime-modifyhitdef-fields-t397-t398-closeout.md`.
