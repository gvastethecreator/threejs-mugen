# T400 ModifyHitDef Static Sprite Priorities

Type: task

Status: resolved in `f846e862`

## Question

Can root ModifyHitDef carry static `p1sprpriority` and `p2sprpriority` into
one active normal HitDef without restarting its move or accepting dynamic
input?

## Source evidence

- Pinned [IKEMEN ModifyHitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8345)
  resolves one redirected character and sends non-RedirectID fields through
  the active receiver's shared HitDef.
- Pinned [IKEMEN HitDef sprite-priority assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7634-L7637)
  evaluates both fields as integers.
- Pinned [IKEMEN accepted-contact writes](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10846-L10849)
  applies p1 to the attacker when allowed and p2 to the receiver after contact.

## Contract

Under explicit `ikemen-go`, static root ModifyHitDef changes only supplied
active normal move sprite-priority fields. The existing accepted-HitDef policy
uses those values when contact succeeds. Omitted fields keep active values.
Dynamic or malformed input remains unsupported.

## In scope

- Typed static compiler lowering with integer truncation.
- In-place normal active HitDef mutation through root RedirectID.
- Required imported trace for a redirected active receiver before direct hit
  contact, including authored role and prior-value telemetry.

## Out of scope

Dynamic expressions, aliases, source-exact omitted/default policy, collision
priority, Projectile and Helper routes, renderer ordering, teams, contact
scheduling, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

The grouped compiler, HitDef, direct-combat, CombatResolver, reversal,
imported-match, and RuntimeTraceGatePresets focal batch passes 7 files / 1109
tests. TypeScript 7, trace-script syntax, and diff hygiene pass. Global
Vitest, aggregate traces, build, and boundary checks remain reserved for the
larger checkpoint.
