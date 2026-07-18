# ADR 0027: Common1 NoFallHitFlag direct admission

- Status: Accepted bounded runtime contract
- Date: 2026-07-18
- Scope: explicit direct HitDef admission against a falling target
- Planning: [`T260`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/260-common1-no-fall-hit-flag.md)
- Implementation: `71f0d265`
- Research: [`2026-07-18-common1-no-fall-hit-flag`](../research/2026-07-18-common1-no-fall-hit-flag.md)
- Closeout: [`2026-07-18-common1-no-fall-hit-flag-closeout`](../reports/2026-07-18-common1-no-fall-hit-flag-closeout.md)

## Context

The pinned IKEMEN character loop rejects a hit against an already falling
target when the attack lacks hitflag `F`, and also rejects it when the attacker
asserts `NoFallHitFlag`. The sandbox already carries authored HitDef hitflags,
but its root, regular, and helper direct admission paths are separate.

## Decision

1. Normalize `NoFallHitFlag` into `RuntimeAssertSpecial` through the existing
   AssertSpecial execution boundary.
2. Centralize the bounded predicate in `CombatResolver`: an explicit hitflag is
   checked only when the defender has move type `H` and `hitFall.falling = true`.
3. Require the comma-delimited `F` token and reject an attacker with typed
   `noFallHitFlag = true`.
4. Apply the predicate at root admission, regular direct resolution,
   equal-priority preparation, and helper direct resolution.
5. Keep omitted hitflags unchanged until default hitflag inference has its own
   source-backed contract.

## Consequences

Direct HitDef paths now agree on the bounded falling-target rule and expose a
typed direct skip/root-admission reason where those paths already expose
diagnostics. The implementation intentionally does not alter projectiles,
reversals, or the existing default-hitflag behavior.

## Evidence

- Focused matrix: `5` files / `83/83` tests.
- Full suite: `230/230` files / `2411/2411` tests.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries and redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional), with
  `skippedOptionalFixtures = 0`.
- `git diff --check`: passed.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

The trace runner still reports the known WebSocket port `24678` occupied by an
unrelated process from `D:\DEV\moklos.club`; the final trace status is passed.

## Claim ceiling

Allowed: typed `NoFallHitFlag` and explicit direct HitDef `F` admission across
the current root, regular, equal-priority preparation, and helper paths for a
runtime falling target.

Blocked: omitted/default hitflag inference, projectile and reversal admission,
exact `hittmp`/`acttmp` timing, custom-state ownership breadth, ZSS/Lua,
rollback/netplay, visual/audio parity, and full MUGEN/IKEMEN parity.
