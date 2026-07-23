# T402 ModifyHitDef Static Kill Fields

Type: task

Status: resolved in `a0b3617a`

## Question

Can root ModifyHitDef carry static `kill` and `guard.kill` into one active
normal HitDef without restarting its move or accepting dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)
  resolves one redirected character and sends non-RedirectID fields through
  the active receiver's shared HitDef.
- Pinned [IKEMEN HitDef kill assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7539-L7580)
  evaluates `kill` and `guard.kill` through the shared HitDef path.
- Pinned [IKEMEN HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1783)
  registers both fields as boolean values.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
`kill` and `guard.kill` values on one active normal move through RedirectID.
Zero means false and any nonzero static number means true. Omitted fields keep
the active values. Dynamic or malformed input remains unsupported.

## In scope

- Typed static compiler lowering for `kill` and `guard.kill`.
- In-place normal active HitDef mutation through root RedirectID.
- Explicit false and true updates without clearing move identity or contact
  memory.
- Required imported direct-hit and guarded-contact traces where lethal damage
  clamps at one life after a redirected false value.

## Out of scope

Dynamic expressions, `fall.kill`, source-exact boolean grammar and defaults,
Projectile and Helper routes, broader team behavior, exact contact scheduling,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

The grouped compiler, HitDef, direct-combat, combat-resolution, reversal,
imported-match, and RuntimeTraceGatePresets focal batch passes 8 files / 1151
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Global
Vitest, aggregate traces, build, and boundary checks remain reserved for the
larger checkpoint.
