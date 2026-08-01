# 15 - T430 M.U.G.E.N CNS Persistent Cadence

Status: closed-bounded
Labels: mugen-runtime, cns, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T429 bounded ZSS combined-wrapper cadence evidence

## Objective

Bring one shared M.U.G.E.N controller gap into evidence: positive constant
`persistent(n)` in raw CNS must control normal active-state execution cadence
without changing the already-bounded ZSS HitPause route.

## Official contract

Elecbyte documents `persistent` and `ignorehitpause` as optional integer
constants on every state controller. The official Ikemen ZSS guide describes
`persistent(n)` as the interval between execution frames and shows the CNS
equivalent `persistent = 5`.

## Current evidence and gap

T429 proves one ZSS-only combined wrapper while hit pause freezes state time.
The runtime's existing predicate intentionally bypasses every non-ZSS source,
so raw CNS `persistent = 2` currently has no normal-scheduler cadence proof.

## Scope

- Audit parser, active-controller scan, and state-entry ownership before
  changing the generic callback.
- Support only positive integer constant `persistent(n)` for normal active
  root controller scans; preserve current behavior for no parameter, malformed
  values, helpers, special states, `persistent = 0`, dynamic values, and raw
  CNS ignore-HitPause pairing.
- Reuse T429's state-entry reset seam where needed, but do not merge its
  paused ZSS counter into general CNS semantics.
- Add one deterministic raw-CNS fixture and required trace proving first pass,
  interval skip, state-entry reset, source location, and no unintended ZSS
  regression.

## Acceptance

- A raw CNS `persistent = 2` controller runs at the first normal state pass,
  skips the next eligible pass, runs on the next interval, and resets after a
  state transition.
- Existing ZSS `persistent` behavior and all no-parameter controllers remain
  stable; raw CNS hit-pause persistence is still explicitly out of scope.
- Focused tests, required trace, typecheck, suite, production build,
  boundaries, hygiene, docs, and claim ceiling close.

## Closure evidence

- Required `mugen-cns-persistent-cadence` trace checksum `f7c32a53` passed in
  `672/672` artifacts (`638` required, `34` optional).
- Focused coverage, `pnpm typecheck`, `pnpm test` (`3262/3262`),
  `pnpm build`, and `node scripts/check_boundaries.cjs` passed.
- The implementation is intentionally limited to positive integer constants in
  ordinary active-root normal scans. It does not claim raw CNS HitPause,
  helpers, specials, dynamic values, or generic controller-VM parity.

## Claim ceiling

Allowed: positive constant raw-CNS `persistent(n)` cadence during ordinary
active root state execution in the named fixture/profile slice.

Blocked: `persistent = 0`, dynamic/non-integer values, generic controller VM
parity, raw CNS `ignorehitpause` pairing, helper/special-state cadence,
ZSS grammar expansion, Lua, rollback/netplay, scores, and full M.U.G.E.N or
Ikemen parity.
