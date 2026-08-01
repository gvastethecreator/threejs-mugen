# 16 - T431 M.U.G.E.N CNS Persistent Zero

Status: closed-bounded
Labels: mugen-runtime, cns, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T430 positive raw-CNS persistent cadence

## Objective

Bring the next explicit M.U.G.E.N persistence rule into evidence: raw CNS
`persistent = 0` may activate a controller only once during a state, without
widening T430's positive interval or T429's paused-ZSS route.

## Official contract

Elecbyte's CNS reference says setting `persistent` to `0` allows a controller
to activate only once during that state. Its controller reference also says
`persistent` must be an integer constant. The official Ikemen ZSS guide calls
`persistent(n)` an execution-frame interval but does not define a zero-wrapper
rule, so this is deliberately a raw-CNS M.U.G.E.N baseline task.

## Current evidence and gap

T430 proves positive constants use state elapsed time in ordinary active root
scans. It deliberately leaves raw nonpositive values ungated. The current
predicate therefore runs raw `persistent = 0` every eligible scan, contrary to
the documented once-per-state rule.

## Scope

- Audit state-entry reset ownership before adding per-controller once markers.
- Support only raw CNS `persistent = 0` in ordinary active root current-state
  scans, where the first trigger-passing scan claims that controller for the
  current state entry.
- Reset the marker at existing root state-entry seams and prove re-entry to the
  same StateDef through an intermediate state.
- Add one deterministic raw-CNS fixture/trace proving first execution,
  repeated skip, state re-entry reset, stable no-parameter execution, and
  preserved T430/T429 evidence.

## Acceptance

- A raw CNS `persistent = 0`, `trigger1 = 1` controller runs once, skips later
  scans in that state, then runs once again after a state-200 -> 201 -> 200
  re-entry.
- Positive T430 cadence, T429 paused ZSS cadence, and raw controllers without
  `persistent` remain stable.
- Focused tests, required trace, typecheck, suite, production build,
  boundaries, hygiene, docs, and claim ceiling close.

## Closure evidence

- Required `mugen-cns-persistent-zero` trace checksum `d13ad12a` passed in
  `673/673` artifacts (`639` required, `34` optional).
- Focused coverage, `pnpm typecheck`, `pnpm test` (`3264/3264`),
  `pnpm build`, and `node scripts/check_boundaries.cjs` passed.
- The fixture proves `200 -> 201 -> 200` re-entry. Direct same-id
  `ChangeState` timing remains explicitly blocked because the current state
  clock does not reset for that route.

## Claim ceiling

Allowed: raw CNS `persistent = 0` first trigger-passing activation once per
ordinary active root state entry in the named M.U.G.E.N profile fixture.

Blocked: ZSS `persistent(0)`, positive interval extensions, `persistent < 0`,
dynamic/non-integer values, raw-CNS `ignorehitpause` pairing, globals/specials,
helpers/custom-state owners, direct same-id `ChangeState` timing,
blocked-dispatch exactness, generic controller VM parity, Lua, rollback/netplay,
scores, and full M.U.G.E.N or Ikemen parity.
