# T403 ModifyHitDef Static Fall Kill

Type: task

Status: resolved in `799749b3`

## Question

Can root ModifyHitDef carry static `fall.kill` into one active normal HitDef
without restarting its move or accepting dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)
  resolves one redirected character and sends non-RedirectID fields through
  the active receiver's shared HitDef.
- Pinned [IKEMEN HitDef fall.kill assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7577-L7584)
  writes `fall_kill` through that shared path.
- Pinned [IKEMEN HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1800)
  registers `fall.kill` as a boolean value.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
`fall.kill` on one active normal move through RedirectID. Zero means false and
any nonzero static number means true. Omitted fields keep their active values.
Dynamic or malformed input remains unsupported.

## In scope

- Typed static compiler lowering for `fall.kill`.
- In-place normal active HitDef mutation through root RedirectID.
- Preserving existing fall metadata and materializing a disabled local fall
  container when the active move has no fall metadata yet.
- Required imported contact trace where deferred lethal HitFallDamage clamps at
  one life after a redirected false value.

## Out of scope

Dynamic expressions, other `fall.*` fields, `hitonce`, `air.juggle`, source
boolean/default behavior, Projectile and Helper routes, broader team behavior,
exact contact scheduling, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

Focused `RuntimeCompiler`, `HitDefSystem`, and `RuntimeTraceGatePresets`
coverage passes 3 files / 730 tests. Trace-script syntax and diff hygiene pass.
The TypeScript 7 gate, larger focal batch, full Vitest, aggregate traces, build,
and boundary checks remain reserved for the accumulated runtime checkpoint.
