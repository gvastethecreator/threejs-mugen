# ADR 0024: Common1 fall defense-up lifecycle

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: imported root-fighter fall defense during Common1 states `5070` and `5100`
- Planning: [`T257`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/257-common1-fall-defense-up.md)
- Implementation: `064e2db0`
- Research: [`2026-07-18-common1-fall-defense-up`](../research/2026-07-18-common1-fall-defense-up.md)
- Closeout: [`2026-07-18-common1-fall-defense-up-closeout`](../reports/2026-07-18-common1-fall-defense-up-closeout.md)

## Context

The pinned IKEMEN source applies the character's fall defense factor when a
fighter reaches Common1 state `5070` or `5100`, skips the increase for
`NoFallDefenceUp`, and clears the factor after the fighter leaves `Hit`. The
runtime already had a synthetic `HitDef`-level `hitFall.defenceUp` extension,
but that field is not the canonical character `[Data]` value and is used by
existing deterministic fixtures.

## Decision

1. Parse `[Data] fall.defence_up` and derive the source-facing
   `data.fall.defence_mul` only when the character did not provide it.
2. Store the transient fall factor as an incoming-damage multiplier so it can
   compose with the existing defense and SuperPause factors.
3. Apply it once at `stateElapsed = 1` in Common1 state `5070` or `5100` for an
   imported root actor whose `moveType` is `H`.
4. Honor `AssertSpecial, NoFallDefenceUp`; prevent duplicate application for
   the same hit-fall record; clear the transient factor when leaving `Hit`.
5. Keep the legacy synthetic `hitFall.defenceUp` path unchanged when no
   canonical transient factor is active.

## Consequences

Canonical imported `[Data]` fall damage now participates in direct incoming
damage and Common1 `HitFallDamage` through one combat scaling boundary. Existing
synthetic traces without canonical `[Data]` do not change. The multiplier is
root-runtime state only; helper/custom-state ownership, exact fall-count and
invulnerability behavior, later Common1 restoration states, ZSS/Lua, and
rollback remain separate.

## Evidence

- Focused recovery, assert-special, combat, hit-fall, hook-order, and loader
  coverage: `7` files, `56/56` tests.
- Full suite: `230/230` files, `2394/2394` tests.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; existing Vite large-chunk advisory remains at
  approximately `1970.44 kB` JavaScript.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed (`599` required, `34` optional).
  The runner still reports the known occupied WebSocket port `24678`; final
  status is passed.
- Browser smoke: N/A because no renderer, Studio, or visible surface changed.

## Claim ceiling

This ADR accepts one source-backed Common1 fall-defense lifecycle for imported
root runtime actors. It does not accept complete Common1/default-table
coverage or MUGEN/IKEMEN parity.
