# 19 - T434 M.U.G.E.N CNS persistent trigger count

Status: closed-bounded
Labels: mugen-runtime, cns, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T433 paired raw-CNS HitPause persistent cadence

## Objective

Align the bounded raw-CNS positive `persistent = 2` path with Elecbyte's
trigger-persistency contract: count trigger-passing activations, not elapsed
state ticks. Preserve the separate ZSS pause counter, raw-CNS zero marker, and
raw-CNS HitPause counter.

## Official contract

Elecbyte's CNS reference describes `persistent = 0` as one activation during a
state and positive values as every Nth time the trigger is true. The state
controller reference requires `persistent` and `ignorehitpause` to be integer
constants. This task only closes the positive raw-CNS `persistent = 2` normal
active-root route with sparse trigger evidence.

## Scope

- Count trigger-passing scans for raw CNS positive `persistent = 2` in ordinary
  active-root current-state normal execution.
- Reset the actor/controller-local counter at state entry.
- Preserve T429 ZSS cadence, T431/T432 raw-CNS zero behavior, and T433 raw-CNS
  HitPause cadence.
- Prove sparse trigger times where tick-time modulo would produce a different
  result.

Out of scope: paused raw CNS (T433), other interval values in new scopes,
globals/specials, standby roots, helpers/custom owners, dynamic/non-integer/
negative values, ZSS grammar, Lua, rollback/netplay, generic VM timing, scores,
and full M.U.G.E.N or Ikemen parity.

## Closure evidence — 2026-07-30

Status: closed-bounded. `rawCnsPersistentTriggerCounters` now counts trigger
passes in the normal raw-CNS route and clears on state entry. The CC0 fixture
uses sparse `StageTime = 1, 3, 4` triggers with `persistent = 2`; `PosAdd`
executes at ticks `1` and `4`, skipping the second trigger at tick `3`.

- Required trace `mugen-cns-persistent-trigger-count`: checksum `3eb88436` in
  `676/676` artifacts (`642` required, `34` optional).
- Focused T430/T433/T434 persistence tests pass (`4` files / `8` tests), full
  `pnpm test` passes (`316` files / `3270` tests), and typecheck, build,
  boundaries, and targeted hygiene pass.
- Claim ceiling remains the named raw-CNS normal active-root positive constant
  path; the full trigger scheduler remains partial.
