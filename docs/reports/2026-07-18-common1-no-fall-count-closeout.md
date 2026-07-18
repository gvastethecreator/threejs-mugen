# Common1 NoFallCount closeout report

- Date: 2026-07-18
- Ticket: [T258](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/258-common1-no-fall-count.md)
- Planning commit: `9bb8b55d`
- Feature commit: `a637b124`
- ADR: [`0025-common1-no-fall-count`](../adr/0025-common1-no-fall-count.md)
- Source note: [`2026-07-18-common1-no-fall-count`](../research/2026-07-18-common1-no-fall-count.md)

## Result

The runtime now normalizes IKEMEN `AssertSpecial, NoFallCount` and suppresses
the existing Common1 state-`5100` `HitFallDamage` ground-impact counter while
the flag is active. The default one-shot increment, fall damage, hit-fall
metadata, and `GetHitVar(fallcount)` path remain unchanged without the flag.

## Verification

- Focused: `4` files, `61/61` tests passed.
- Full: `230/230` files, `2396/2396` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional).
- `git diff --check`: passed for the implementation and closeout patch.
- Browser smoke: N/A; no visual or Studio surface changed.

The trace runner logs WebSocket port `24678` already occupied by an unrelated
Node process from `D:\DEV\moklos.club`; it does not change the final trace
status.

## Quality audit

- Artifact verdict: better. The IKEMEN-only opt-out is explicit and does not
  alter the default fall-count or existing trace contract.
- Adversarial cases covered: flag normalization, suppression with zero fall
  damage, default count behavior, and continued `GetHitVar(fallcount)` reads.
- Verification state: verified for the bounded controller contract. Browser
  gate is N/A, not silently green.
- Residual risk: the count remains controller-bound rather than state-loop
  bound, so exact `acttmp` timing and multi-fall behavior are not claimed.

## Claim boundary

Allowed: typed `NoFallCount`, bounded state-`5100` counter suppression, default
counter preservation, and existing fall-count read compatibility.

Blocked: exact Common1 state-loop timing, repeated-fall invulnerability,
recovery shortening, `NoFallHitFlag`, fall-count reset/lifetime parity,
helpers/custom states, ZSS/Lua, rollback/netplay, visual/audio parity, and full
MUGEN/IKEMEN parity.

## Next frontier

Keep the remaining fall flags and repeated-fall behavior separate; the next
slice needs an explicit source-backed ownership decision for state-loop timing
before changing `fallCount` mutation order.
