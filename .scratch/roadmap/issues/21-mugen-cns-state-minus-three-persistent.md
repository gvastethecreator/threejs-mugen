# 21 - T436 M.U.G.E.N CNS State -3 persistent

Status: closed-bounded
Labels: mugen-runtime, cns, special-state, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T435 raw-CNS State -2 trigger-count persistency

## Objective

Extend the bounded raw-CNS `persistent = 2` trigger-count contract to the
ordinary M.U.G.E.N `StateDef -3` global state. The counter must survive
current-state changes while the actor remains the owner of its state.

## Official contract

Elecbyte's CNS reference says `StateDef -3` is checked every tick before the
current state, except while the player is using another player's state. The
controller reference says `persistent` is an integer constant and the CNS
reference says positive values activate on every Nth trigger-passing time.

## Scope

- Raw CNS only, `persistent = 2`, `StateDef -3`, ordinary playable root,
  normal non-pause scans.
- Count sparse trigger passes in an actor/controller-local map that is not
  reset by current-state entry.
- Admit the route only when `fighter.stateOwner` is undefined, preserving the
  official exclusion for another player's state.
- Preserve T429 ZSS, T431/T432 zero, T433 paused positive, T434 normal
  trigger-count, and T435 `-2` behavior.

Out of scope: `-2`/`-1` expansion, Ikemen `-4`/`+1`, player-owned custom
states, pause scans, standby roots, helpers, dynamic/non-integer/negative
values, ZSS/Lua, generic VM timing, rollback, scores, and full
M.U.G.E.N/Ikemen parity.

## Acceptance

- CC0 fixture loads `StateDef -3`, current state `0 -> 200`, and source-located
  sparse triggers `StageTime = 1, 3, 4` with `persistent = 2`.
- Global controller executes on ticks `1` and `4`, skips tick `3`, and remains
  active after the current-state transition.
- Runtime gate checks the no-`stateOwner` boundary; no player-owned custom
  state claim is introduced.
- Focused tests, required trace, typecheck, full suite, build, boundaries,
  hygiene, docs, and bounded claim close.

## Closure evidence — 2026-07-30

- Focused fixture: `src/tests/MugenCnsStateMinusThreePersistentFixture.test.ts`,
  1 file / 2 tests passed.
- Required trace `mugen-cns-state-minus-three-persistent` checksum `b2719d71`
  passed in `678/678` artifacts (`644` required, `34` optional).
- Full `pnpm test`: `318` files / `3274` tests passed.
- `pnpm typecheck`, `pnpm build`, `node scripts/check_boundaries.cjs`, and
  targeted diff hygiene passed. No UI route changed; browser smoke is N/A.
- Claim ceiling remains the named raw-CNS `StateDef -3`, `persistent = 2`,
  normal playable-root trigger-count route when the actor owns its state.
