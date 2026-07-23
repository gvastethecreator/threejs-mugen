# T395 HitDef NumHits ReceivedHits

Type: task

Status: resolved in `c8676b20`

## Question

Can a direct HitDef with static `numhits` update state-scoped `ReceivedHits`
by the authored count while keeping received damage unchanged?

## Source evidence

- Pinned [IKEMEN HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1814-L1817)
  stores `numhits` as an integer.
- Pinned [IKEMEN normal-hit counter update](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11283-L11300)
  adds `hd.numhits` for a normal hit.

## Contract

The existing typed direct HitDef count reaches the target's state-scoped
`ReceivedHits`. Omission retains the current count of one. The damage amount
and `ReceivedDamage` value keep their existing behavior.

## In scope

- Direct player HitDef contact.
- Existing `RuntimeGetHitVars.hitCount` and contact-memory ownership.
- Focused direct-combat proof.

## Out of scope

Projectile counters, FightScreen combo display, score, dynamic input, teams,
exact source timing, rollback/netplay, and full parity.

## Verification

The grouped T394-T396 focal batch passes 6 files / 459 tests, TypeScript 7,
trace-script syntax, and diff hygiene. See
`docs/research/2026-07-23-runtime-numhits-t394-t396-closeout.md`.
