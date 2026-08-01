# 22 - T437 M.U.G.E.N CNS State -1 persistent

Status: closed-bounded
Labels: mugen-runtime, cns, cmd, state-entry, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T436 raw-CNS State -3 trigger-count persistency

## Objective

Extend the bounded raw controller `persistent = 2` trigger-count contract to
imported M.U.G.E.N `State -1` setup controllers sourced from the character CMD
file. The counter must survive current-state changes and remain separate from
the root-state and special-state maps.

## Official contract

Elecbyte's CNS/controller reference treats `State -1` as the command-driven
state-controller block evaluated before the current state. `persistent` is an
integer constant and positive values activate on every Nth trigger-passing
time. The runtime preserves the existing input/AI-owned State -1 setup seam;
this task only adds the positive constant cadence to setup controllers.

## Scope

- Imported raw CMD/CNS only, `persistent = 2`, `State -1` setup controller,
  ordinary playable root, normal non-pause scans.
- Count sparse trigger passes in an actor/controller-local map that is not
  reset by current-state entry.
- Preserve T429 ZSS, T431/T432 zero, T433 paused positive, T434 normal
  trigger-count, T435 `-2`, and T436 `-3` behavior.

Out of scope: `State -1` `ChangeState` routing cadence, other intervals,
`ignorehitpause`, pause scans, helpers, player-owned custom states, dynamic or
non-integer values, ZSS/Lua, generic VM timing, rollback, scores, and full
M.U.G.E.N/Ikemen parity.

## Acceptance

- CC0 fixture loads a CMD `State -1` `VarSet` with `StageTime = 1, 3, 4` and
  `persistent = 2`, plus CNS current state `0 -> 200`.
- Setup controller executes on ticks `1` and `4`, skips tick `3`, and survives
  the current-state transition.
- Focused tests, required trace, typecheck, full suite, build, boundaries,
  hygiene, docs, and bounded claim close.

## Closure evidence — 2026-07-30

- Focused fixture: `src/tests/MugenCnsStateMinusOnePersistentFixture.test.ts`,
  1 file / 2 tests passed; parser and runtime trace stay source/fixture
  located through the CMD path.
- Required trace `mugen-cns-state-minus-one-persistent` checksum `ba3d289d`
  passed in `679/679` artifacts (`645` required, `34` optional).
- Full suite: `319` files / `3276` tests passed.
- Typecheck, build, boundaries, and targeted diff hygiene: passed. No UI route
  changed; browser smoke is N/A.
- Claim ceiling remains the named imported State -1 setup `VarSet` route only;
  State -1 ChangeState cadence and broad command-state parity remain blocked.
