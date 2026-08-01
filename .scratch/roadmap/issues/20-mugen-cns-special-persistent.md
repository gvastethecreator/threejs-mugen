# 20 - T435 M.U.G.E.N CNS special-state persistent

Status: closed-bounded
Labels: mugen-runtime, cns, special-state, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T434 raw-CNS trigger-count persistency

## Objective

Extend the bounded raw-CNS `persistent = 2` trigger-count contract to the
ordinary M.U.G.E.N `StateDef -2` special state, which is checked every tick
before the current state. The counter must survive current-state changes.

## Official contract

Elecbyte's CNS reference says `StateDef -2` contains controllers checked every
tick and that special states run before the current state. The controller
reference says `persistent` is an integer constant and the CNS reference says
positive values activate on every Nth trigger-passing time.

## Scope

- Raw CNS only, `persistent = 2`, `StateDef -2`, ordinary playable root,
  normal non-pause scans.
- Count sparse trigger passes in an actor/controller-local map that is not
  reset by current-state entry.
- Preserve T429 ZSS, T431/T432 zero, T433 paused positive, and T434 current
  normal-state trigger-count behavior.

Out of scope: `-3`/`-1`, Ikemen `-4`/`+1`, pause scans, standby roots, helpers,
dynamic/non-integer/negative values, ZSS/Lua, generic VM timing, rollback,
scores, and full M.U.G.E.N/Ikemen parity.

## Acceptance

- CC0 fixture loads `StateDef -2`, current state `0 -> 200`, and source-located
  sparse triggers `StageTime = 1, 3, 4` with `persistent = 2`.
- Special controller executes on ticks `1` and `4`, skips tick `3`, and remains
  active after the current-state transition.
- Focused tests, required trace, typecheck, full suite, build, boundaries,
  hygiene, docs, and bounded claim close.

## Closure evidence — 2026-07-30

- Focused fixture: `src/tests/MugenCnsSpecialPersistentFixture.test.ts`, 1 file /
  2 tests passed; source-located `-2`, `0`, and `200` states execute with
  sparse trigger passes at ticks `1` and `4`.
- Required trace `mugen-cns-special-persistent` checksum `6fce3962` passed in
  `677/677` artifacts (`643` required, `34` optional).
- Full `pnpm test`: `317` files / `3272` tests passed.
- `pnpm typecheck`, `pnpm build`, `node scripts/check_boundaries.cjs`, and
  targeted diff hygiene passed. No UI route changed; browser smoke is N/A.
- Claim ceiling remains the named raw-CNS `StateDef -2`, `persistent = 2`,
  normal playable-root trigger-count route. T436 owns the separate `-3` slice.
