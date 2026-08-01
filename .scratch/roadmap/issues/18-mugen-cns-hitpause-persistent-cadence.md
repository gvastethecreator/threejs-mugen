# 18 - T433 M.U.G.E.N CNS HitPause persistent cadence

Status: closed-bounded
Labels: mugen-runtime, cns, hitpause, persistent, controller-scheduler, runtime-trace, closed-bounded
Lane: R1 shared controller VM
Priority: P1
Depends on: T432 paired raw-CNS HitPause zero evidence

## Objective

Prove one raw-CNS positive-interval route that remains open after T432: an
ordinary active-root controller with `ignorehitpause = 1` and positive constant
`persistent = 2` must use paused scheduler passes rather than frozen state time
for first/skip/interval/reset behavior.

## Official contract

Elecbyte documents `persistent` and `ignorehitpause` as optional integer
constants on state controllers. Its controller/CNS documentation establishes
the baseline persistence behavior, while the official Ikemen ZSS guide calls
positive `persistent(n)` an execution-frame interval. T429 already proves a
ZSS-only paused counter; this task establishes only the corresponding raw-CNS
fixture route and does not make a ZSS grammar claim.

## Current evidence and gap

T430/T434 prove positive raw-CNS cadence in normal active-root scans. T432 proves a
raw-CNS zero marker can be admitted through the pause-only filter. During
HitPause, state time remains frozen, and raw positive values still bypass a
cadence counter; they can therefore run on every eligible pause scan instead
of on their interval.

## Scope

- Audit whether the T429 counter can be generalized without merging ZSS and raw
  source policies.
- Support only positive integer raw CNS `persistent = 2` paired with
  `ignorehitpause = 1` in ordinary active-root current-state pause scans.
- Prove first eligible pause run, skip, interval run, state-entry reset, and
  a frozen unwrapped control using one deterministic CNS-owned HitPause fixture.
- Preserve normal T430/T431/T432 behavior and the ZSS T429 counter.

## Acceptance

- The paired raw CNS positive controller runs on first and interval eligible
  pause scans, skips the intervening scan, and resets after bounded state
  entry.
- Raw CNS zero pause behavior, normal persistence gates, and ZSS cadence remain
  stable.
- Focused tests, required trace, typecheck, suite, production build,
  boundaries, hygiene, docs, and bounded claim close.

## Claim ceiling

Allowed: paired raw-CNS positive `persistent = 2` plus `ignorehitpause = 1`
cadence only during ordinary active-root pause scans in the named fixture.

Blocked: other interval values, unpaired `ignorehitpause`, raw CNS globals,
specials/helpers/custom-state owners, dynamic/non-integer/negative values,
ZSS grammar or zero semantics, direct same-id `ChangeState` timing,
blocked-dispatch exactness, generic controller VM parity, Lua, rollback/netplay,
scores, and full M.U.G.E.N or Ikemen parity.

## Closure evidence — 2026-07-30

Status: closed-bounded. The runtime now owns a raw-CNS controller-local
HitPause counter separate from the ZSS counter and the T432 zero marker. The
named CC0 fixture executes paired `PosAdd` at pause ticks `2, 4, 6` around
`200 -> 201 -> 200`; the unwrapped `VelSet` remains frozen.

- Required trace `mugen-cns-hitpause-persistent-cadence`: checksum `d6d00fd0`.
- `pnpm qa:trace`: `675/675` artifacts, `641` required and `34` optional.
- Focused persistence/runtime slice: `6` files, `335` tests passed.
- Full `pnpm test`: `315` files, `3268` tests passed; only known jsdom Canvas
  `getContext` warnings.
- `pnpm typecheck`, `pnpm build`, `node scripts/check_boundaries.cjs`, and
  targeted diff hygiene passed. UI smoke is N/A; no UI route changed.

The claim remains limited to raw CNS `persistent = 2` paired with
`ignorehitpause = 1` in ordinary active-root current-state pause scans. Other
intervals, owners, wrappers, and generic VM parity remain blocked.
