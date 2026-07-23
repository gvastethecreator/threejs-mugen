# T404 ModifyHitDef Static HitOnce

Type: task

Status: resolved in `c12f54e3`

## Question

Can root ModifyHitDef carry static `hitonce` into one active normal HitDef
without restarting its move, then block a later direct target after the first
contact?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7539-L7586)
  assigns `hitonce` through the active receiver's shared HitDef.
- Pinned [IKEMEN HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1800)
  registers `hitonce` as a boolean expression.
- Pinned [IKEMEN HitDef defaults and contact path](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L849-L1006)
  carries the source default and per-contact consumption behavior.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
`hitonce` on one active normal move through RedirectID. Zero means false and
any nonzero static number means true. Omitted fields keep their active values.
Once local direct combat records a contact for a true value, a later direct
target skips for that move. Same-frame equal-priority trades reserve that
consumption before their contact memory commits. Dynamic or malformed
ModifyHitDef input remains unsupported.

## In scope

- Typed static compiler lowering for `hitonce` on HitDef and ModifyHitDef.
- In-place normal active HitDef mutation through root RedirectID.
- Direct and priority admission checks backed by the active move's true value.
- Same-frame equal-priority reservation for one hitonce attacker.
- Required imported Tag RedirectID trace where P4 reaches P1 and P3, damages
  P1 once, and leaves P3 at full life.

## Out of scope

Dynamic expressions, source throw defaults, target dropping, exact source
target membership, Projectiles, Helpers, broader team behavior, `air.juggle`,
exact contact scheduling, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

Focused `RuntimeCompiler`, `HitDefSystem`, `RuntimeCombatResolutionSystem`,
`DirectCombatSystem`, and `RuntimeTraceGatePresets` coverage passes 5 files /
794 tests. Trace-script syntax and diff hygiene pass. The TypeScript 7 gate,
full Vitest, aggregate traces, build, and boundary checks remain reserved for
the accumulated runtime checkpoint.
