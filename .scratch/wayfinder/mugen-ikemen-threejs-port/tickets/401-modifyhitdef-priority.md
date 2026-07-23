# T401 ModifyHitDef Static Priority

Type: task

Status: resolved in `e21ae170`

## Question

Can root ModifyHitDef carry a static priority and optional priority type into
one active normal HitDef without preserving local priority clamps or accepting
dynamic input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)
  resolves one redirected character and sends non-RedirectID fields through
  the active receiver's shared HitDef.
- Pinned [IKEMEN priority assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7620-L7624)
  evaluates priority as an integer and documents unrestricted negative IKEMEN
  values.
- Pinned [IKEMEN priority compiler path](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1840-L1860)
  compiles an integer value with optional H, M, or D priority type.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
priority metadata on one active normal move through RedirectID. The shared
direct-contact normalizer truncates finite values toward zero and does not use
the old local `0..10` or `1..7` clamps. An omitted type defaults to Hit.
Dynamic, malformed, or unsupported input remains unsupported.

## In scope

- Typed static compiler lowering for `priority = value[, H|M|D]`.
- In-place normal active HitDef mutation through root RedirectID.
- Shared finite integer normalization for direct HitDef activation and clash
  comparison.
- Required imported trace where redirected priority `12` defeats priority `8`
  after direct simultaneous contact.

## Out of scope

Dynamic expressions, exact source integer overflow behavior, aliases,
source-exact omitted/default behavior, broad priority-type scheduling,
Projectile and Helper routes, collision variation, teams, source timing,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

The grouped compiler, HitDef, direct-combat, CombatResolver, reversal,
imported-match, and RuntimeTraceGatePresets focal batch passes 8 files / 1149
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Global
Vitest, aggregate traces, build, and boundary checks remain reserved for the
larger checkpoint.
