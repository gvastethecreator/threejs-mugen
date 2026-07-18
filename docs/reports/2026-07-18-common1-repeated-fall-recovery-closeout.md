# Common1 repeated-fall recovery closeout report

- Date: 2026-07-18
- Ticket: [T259](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/259-common1-repeated-fall-recovery.md)
- Planning commit: `872d7c25`
- Feature commit: `33ead1f9`
- Regression-fix commit: `9a47e635`
- ADR: [`0026-common1-repeated-fall-recovery`](../adr/0026-common1-repeated-fall-recovery.md)
- Source note: [`2026-07-18-common1-repeated-fall-recovery`](../research/2026-07-18-common1-repeated-fall-recovery.md)

## Result

Imported-root Common1 state entry now owns the bounded repeated-fall slice:
`5070`/`5100` increments are idempotent and honor `NoFallCount`; a second
counted `5100` entry halves positive `down.recovertime`, using
`data.liedown.time` when the actor does not provide a timer; and a result of
`<= 10` installs typed `deny SCA / 180` protection in `HitBy` slot 1 while
preserving slot 2. The legacy `HitFallDamage` controller count remains
compatible and is not replayed as a second fall on the same entry.

## Verification

- Focused: `7` files, `60/60` tests passed.
- Full: `230/230` files, `2401/2401` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional).
- `git diff --check`: passed.
- Browser smoke: N/A; no visible or Studio surface changed.

The trace runner logs WebSocket port `24678` already occupied by an unrelated
Node process from `D:\DEV\moklos.club`; it does not change the final trace
status.

## Quality audit

- Source alignment: the bounded state-entry timing, second-fall shortening,
  finite IKEMEN recovery window, and `NoFallCount` guard are backed by the
  pinned IKEMEN source and common1 ZSS ordering.
- Adversarial cases covered: duplicate state-entry calls, a legacy controller
  count in the same entry, `NoFallCount`, later-entry marker clearing, timer
  fallback, short-window slot installation, secondary-slot preservation, and
  existing lie-down recovery routes.
- Compatibility audit: the full trace corpus returned green after the
  legacy-entry regression fix; no trace expectations were weakened.
- Verification state: bounded runtime contract verified. Browser gate is N/A,
  not silently green.

## Claim boundary

Allowed: imported-root Common1 repeated-fall recovery and typed eligibility
window described above, plus compatibility with the existing controller-bound
counter.

Blocked: exact `acttmp`/`hittmp` behavior, `NoFallHitFlag`, generic hitflag `F`,
MUGEN infinite-duration semantics, lifetime/reset parity, helper/projectile/
team/custom-state ownership, ZSS/Lua, rollback/netplay, visual/audio parity,
and full MUGEN/IKEMEN parity.

## Next frontier

The next fall tranche should be separately scoped around generic `F`
hit-eligibility or `NoFallHitFlag`, with source and ownership evidence before
changing the current eligibility or Common1 boundaries.
