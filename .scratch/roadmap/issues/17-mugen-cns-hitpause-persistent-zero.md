# 17 - T432 M.U.G.E.N CNS HitPause persistent zero

Status: closed-bounded
Labels: mugen-runtime, cns, hitpause, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T431 raw-CNS `persistent = 0` normal-state evidence

## Objective

Prove one small raw-CNS intersection left open by T428-T431: an ordinary
active-root controller with `ignorehitpause = 1` and `persistent = 0` must run
on its first eligible HitPause scan only once per state entry, without turning
the raw-CNS pause scheduler into general persistence parity.

## Official contract

Elecbyte describes `persistent` and `ignorehitpause` as optional integer
constants on state controllers, and its CNS reference states that
`persistent = 0` permits a controller to activate only once in a state. The
official Ikemen ZSS guide documents its own wrapper interval syntax, but does
not define a raw-CNS or zero-wrapper rule; this task remains a M.U.G.E.N CNS
runtime cut rather than an Ikemen grammar claim.

## Current evidence and gap

T428 proves a ZSS `ignoreHitPause` route, T429 proves its positive ZSS paused
cadence, T430 proves raw-CNS positive cadence during normal active-root scans,
and T431 proves raw-CNS zero once per normal state entry. The raw-CNS pause-only
scan intentionally does not use T430/T431's normal-route policy, so a raw CNS
zero controller can still execute on every eligible paused scan.

## Scope

- Audit the existing pause-only root scan and its relationship to the T431
  actor/controller-local zero marker.
- Support only a raw-CNS current-state active-root controller carrying both
  `ignorehitpause = 1` and `persistent = 0`.
- Prove first eligible paused execution, repeated paused skip, state-entry
  reset, preserved normal T431 behavior, and a frozen unwrapped control.
- Use one deterministic CNS-owned HitPause fixture and one required trace.

## Acceptance

- The paired raw-CNS controller executes on the first eligible pause scan,
  skips later pause scans in that state, and executes once after a bounded
  state re-entry.
- Raw-CNS normal zero behavior, T430 positive normal cadence, and T429 ZSS
  pause cadence remain stable.
- Focused tests, required trace, typecheck, suite, production build,
  boundaries, hygiene, docs, and bounded claim close.

## Closure evidence

- Required `mugen-cns-hitpause-persistent-zero` trace checksum `94b49516`
  passed in `674/674` artifacts (`640` required, `34` optional).
- The fixture starts real CNS-owned HitPause, executes the paired raw CNS
  `PosAdd` at pause ticks 2 and 6 around `200 -> 201 -> 200`, skips repeated
  scans, and leaves the unwrapped `VelSet` frozen.
- Focused 5-file/333-test coverage, `pnpm typecheck`, full `314/3266` suite,
  `pnpm build`, and `node scripts/check_boundaries.cjs` passed. No UI route
  changed, so browser smoke is N/A.

## Claim ceiling

Allowed: paired raw-CNS `ignorehitpause = 1` plus `persistent = 0` once per
ordinary active-root state entry in the named fixture/profile slice.

Blocked: raw-CNS positive persistence during HitPause, unpaired
`ignorehitpause`, ZSS `persistent(0)`, globals/specials/helpers/custom-state
owners, dynamic/non-integer/nonzero values, direct same-id `ChangeState`
timing, blocked-dispatch exactness, generic controller VM parity, Lua,
rollback/netplay, scores, and full M.U.G.E.N or Ikemen parity.
