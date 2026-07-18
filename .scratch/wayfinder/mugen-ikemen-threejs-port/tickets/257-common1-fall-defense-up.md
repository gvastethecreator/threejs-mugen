# Ticket 257: Common1 fall defense-up

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: bounded Common1 fall-defense lifecycle for imported root fighters
- Depends on: imported `[Data]` constants, `RuntimeRecoverySystem`, and the
  existing hit-fall damage path
- Research: [`docs/research/2026-07-18-common1-fall-defense-up.md`](../../../docs/research/2026-07-18-common1-fall-defense-up.md)
- Source contract: official MUGEN Common1 behavior and pinned IKEMEN GO source
  at commit `044da72008b8ba13caf7b0f820526ce16e955fb3`
- Implementation: `064e2db0`
- Closeout: [`docs/adr/0024-common1-fall-defense-up.md`](../../../docs/adr/0024-common1-fall-defense-up.md), [`docs/reports/2026-07-18-common1-fall-defense-up-closeout.md`](../../../docs/reports/2026-07-18-common1-fall-defense-up-closeout.md)

## Question

Which small Common1 rule can be promoted next without confusing canonical
`[Data] fall.*` values with the repository's older synthetic hit-fall metadata?

## Bounded contract

- Read `[Data] fall.defence_up` and the derived `data.fall.defence_mul` as
  canonical imported character data.
- Apply the temporary incoming-damage reduction at `state 5070` or `5100` on
  the first state tick while the fighter remains in `Hit`.
- Restore the transient multiplier when the fighter leaves `Hit`.
- Honor `AssertSpecial, NoFallDefenceUp` for the same lifecycle.
- Keep the existing synthetic `HitDef`-level `fall.defence_up` extension as a
  compatibility path until its callers are migrated separately.

## Out of scope

Fall-count parity, exact Common1 source-file merging, custom state ownership,
helper-owned fall defense, rollback/netplay, ZSS/Lua, and full MUGEN/IKEMEN
parity.

## Acceptance evidence

- Focused recovery, assert-special, combat-scaling, and hit-fall tests cover
  application, one-shot behavior, restoration, and the opt-out flag.
- Imported `[Data]` derivation is covered without changing character-over-common
  precedence.
- Focused coverage passes `7` files / `56/56` tests; the full suite passes
  `230/230` files / `2394/2394` tests.
- TypeScript 7, build, boundaries, redirect boundary, `633/633` traces, and
  diff hygiene pass before closeout.
- Browser smoke is N/A because this slice changes runtime semantics only.

## Claim ceiling

This ticket closes one Common1/default-table rule for the root runtime. It does
not establish complete Common1 coverage or MUGEN/IKEMEN parity.

## Answer

The runtime now keeps canonical `[Data]` fall defense separate from the legacy
synthetic `HitDef` extension. Imported root actors receive the bounded
`5070`/`5100` transient factor, `NoFallDefenceUp` is honored, and leaving
`Hit` clears the factor. No compatibility score moved.
