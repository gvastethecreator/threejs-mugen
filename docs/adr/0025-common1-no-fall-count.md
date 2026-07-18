# ADR 0025: Common1 NoFallCount boundary

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: IKEMEN `AssertSpecial, NoFallCount` at the existing Common1 `HitFallDamage` counter
- Planning: [`T258`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/258-common1-no-fall-count.md)
- Implementation: `a637b124`
- Research: [`2026-07-18-common1-no-fall-count`](../research/2026-07-18-common1-no-fall-count.md)
- Closeout: [`2026-07-18-common1-no-fall-count-closeout`](../reports/2026-07-18-common1-no-fall-count-closeout.md)

## Context

The pinned IKEMEN character loop checks `NoFallCount` before incrementing
`fallcount` in Common1 fall states. This repository already exposes
`RuntimeHitFall.fallCount` through `GetHitVar(fallcount)`, but its bounded
increment currently occurs at the `HitFallDamage` controller boundary in state
`5100`. The missing behavior is the flag opt-out, not a complete replacement of
the loop.

## Decision

1. Normalize `NoFallCount` into `RuntimeAssertSpecial`.
2. Pass the active flag into the existing Common1 ground-impact counter.
3. Preserve fall damage and all other hit-fall metadata while suppressing only
   the bounded `fallCount` increment.
4. Keep the default one-shot counter and existing `GetHitVar(fallcount)` path
   unchanged when the flag is absent.

## Consequences

IKEMEN-authored `NoFallCount` now has an explicit runtime representation and
prevents the current state-`5100` counter from incrementing. The implementation
does not move the count to the engine state loop, so `acttmp`, repeated-fall
invulnerability, recovery shortening, other fall flags, helper/custom-state
ownership, and full parity remain separate.

## Evidence

- Focused `HitFallDamage`, AssertSpecial, CNS subset, and expression coverage:
  `4` files, `61/61` tests.
- Full suite: `230/230` files, `2396/2396` tests.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; existing Vite large-chunk advisory remains at
  approximately `1970.52 kB` JavaScript.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed (`599` required, `34` optional).
  The runner still reports the known occupied WebSocket port `24678`; final
  status is passed.
- Browser smoke: N/A because no renderer, Studio, or visible surface changed.

## Claim ceiling

This ADR accepts one IKEMEN opt-out at the current Common1 ground-impact
controller boundary. It does not accept complete fall-count, invulnerability,
or MUGEN/IKEMEN parity.
