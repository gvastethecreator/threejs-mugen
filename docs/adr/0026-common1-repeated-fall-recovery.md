# ADR 0026: Common1 repeated-fall recovery boundary

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: imported-root IKEMEN-style Common1 repeated-fall recovery
- Planning: [`T259`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/259-common1-repeated-fall-recovery.md)
- Implementation: `33ead1f9`
- Regression fix: `9a47e635`
- Research: [`2026-07-18-common1-repeated-fall-recovery`](../research/2026-07-18-common1-repeated-fall-recovery.md)
- Closeout: [`2026-07-18-common1-repeated-fall-recovery-closeout`](../reports/2026-07-18-common1-repeated-fall-recovery-closeout.md)

## Context

The pinned IKEMEN loop applies Common1 fall mechanics at the first active tick
of states `5070` and `5100`, before the authored `HitFallDamage` controller in
the imported `common1.cns.zss` route. The sandbox already had a bounded
controller fallback that counted state `5100`, so moving the behavior requires
an entry marker and compatibility with a controller that may have counted the
same entry earlier in the tick.

## Decision

1. Keep the state-entry boundary inside `RuntimeRecoverySystem` and restrict it
   to imported-root actors currently owned by Common1 states `5070`/`5100`.
2. Count once per Common1 entry unless typed `NoFallCount` is active. Preserve
   `fallCountedGroundImpact` when `HitFallDamage` already counted the current
   `5100` entry, and clear entry markers after leaving the Common1 states.
3. On a second counted `5100` entry, ensure a positive down-recovery window,
   halve it with `data.liedown.time` as the fallback, and install slot 1
   `deny SCA / 180` when the result is at most `10`, preserving slot 2.
4. Retain the existing `HitFallDamage` controller fallback for isolated callers
   and keep fall defense, damage, and unrelated hit-fall metadata separate.

## Consequences

The runtime now exposes the bounded repeated-fall count and recovery-shortening
boundary at Common1 state entry without double-counting legacy controller
routes. The typed eligibility window reuses existing `HitBy` slot ticking and
expiry. The contract remains imported-root and does not claim all Common1
states, generic fall hitflags, or engine-wide timing parity.

## Evidence

- Focused matrix: `7` files / `60/60` tests.
- Full suite: `230/230` files / `2401/2401` tests.
- TypeScript 7 typecheck: passed.
- Production build: passed; the existing Vite large-chunk advisory remains.
- Repository boundaries and redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional).
- `git diff --check`: passed for the implementation and closeout patch.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

The trace runner still reports the known WebSocket port `24678` occupied by an
unrelated Node process from `D:\DEV\moklos.club`; the final trace status is
passed.

## Claim ceiling

Allowed: imported-root Common1 `5070`/`5100` entry counting, `NoFallCount`
interaction, second-counted-`5100` recovery shortening, bounded `HitBy` slot
protection, and legacy counter compatibility.

Blocked: `acttmp`, `NoFallHitFlag`, generic hitflag `F`, exact MUGEN infinite
duration, fall-count lifetime/reset parity, helper/projectile/team/custom-state
ownership, ZSS/Lua, rollback/netplay, browser presentation, and full
MUGEN/IKEMEN parity.
