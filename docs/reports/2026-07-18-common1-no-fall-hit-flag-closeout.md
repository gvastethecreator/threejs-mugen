# Common1 NoFallHitFlag closeout report

- Date: 2026-07-18
- Ticket: [T260](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/260-common1-no-fall-hit-flag.md)
- Planning commit: `4637d4e9`
- Feature commit: `71f0d265`
- ADR: [`0027-common1-no-fall-hit-flag`](../adr/0027-common1-no-fall-hit-flag.md)
- Source note: [`2026-07-18-common1-no-fall-hit-flag`](../research/2026-07-18-common1-no-fall-hit-flag.md)

## Result

The runtime now normalizes IKEMEN `AssertSpecial, NoFallHitFlag` and shares one
direct HitDef admission predicate across root admission, ordinary direct
combat, equal-priority preparation, and helper direct combat. When a defender
is already falling (`moveType = H` and `hitFall.falling = true`), an explicit
authored hitflag must contain `F` and the attacker must not assert
`NoFallHitFlag`. Omitted hitflags retain the existing compatibility behavior.

## Verification

- Focused: `5` files, `83/83` tests passed.
- Full: `230/230` files, `2411/2411` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains at
  approximately `1972.38 kB` JavaScript.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional), with
  `skippedOptionalFixtures = 0`.
- `git diff --check`: passed.
- Browser smoke: N/A; no visible or Studio surface changed.

The trace runner logs WebSocket port `24678` already occupied by an unrelated
Node process from `D:\DEV\moklos.club`; it does not change the final trace
status.

## Quality audit

- Source alignment: the explicit `F` / `NoFallHitFlag` rejection is backed by
  the pinned IKEMEN character loop; the Elecbyte reference was checked and
  does not define this IKEMEN-specific extension.
- Adversarial cases covered: no `F`, attacker opt-out, explicit `F`, omitted
  hitflag, non-falling target, root pre-admission, regular direct resolution,
  equal-priority preparation, and helper direct rejection without mutation.
- Compatibility audit: the complete trace corpus remained green; no existing
  trace expectation was weakened and no compatibility score moved.
- Verification state: bounded runtime contract verified. Browser gate is N/A,
  not silently green.

## Claim boundary

Allowed: the explicit direct HitDef falling-target rule and typed
`NoFallHitFlag` representation described above.

Blocked: generic/default hitflag inference, projectiles, reversals, exact
`hittmp`/`acttmp` timing, complete Common1 state-loop parity, custom-state
ownership breadth, ZSS/Lua, rollback/netplay, visual/audio parity, and full
MUGEN/IKEMEN parity.

## Next frontier

The next fall tranche should characterize default hitflag inference or exact
`hittmp`/`acttmp` state-loop ownership with a new source-backed ticket. Do not
expand this predicate into projectile admission without first extending the
projectile model with an explicit authored hitflag contract.
