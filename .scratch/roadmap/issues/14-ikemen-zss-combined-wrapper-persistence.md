# 14 - T429 Ikemen ZSS Combined Wrapper Persistence

Status: closed-bounded
Labels: ikemen-runtime, zss, persistent, hitpause, runtime-trace, closed-bounded
Lane: I2 bounded runtime
Priority: P2
Depends on: T427 live ZSS state pipeline; T428 ZSS HitPause wrapper semantics

## Objective

Prove the official combined ZSS form `ignoreHitPause persistent(n) if ...`
through a real mixed CNS/ZSS global hit pause, with an execution cadence that
does not collapse when the character's state clock is frozen.

## Official contract

Elecbyte documents `persistent` and `ignorehitpause` as optional integer
constant controller parameters. The official
[Ikemen ZSS guide](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS)
documents their braced wrappers and explicitly permits the combined form before
an `if` block.

## Current evidence and gap

T427 parses and executes `persistent(2)` in a normal ZSS state route. T428
proves `ignoreHitPause` reaches the global-pause scheduler. The current
interval predicate uses `stateElapsed`; hit pause freezes that clock, so a
combined wrapper would currently pass every eligible pause frame instead of
honoring its interval.

## Scope

- Reuse the T427 allowlist and T428 CNS pause origin; do not add ZSS controller
  families, dynamic interval parsing, or ZSS `HitDef`.
- Track only the bounded parsed ZSS-controller cadence needed when a valid
  constant `persistent(n)` wrapper is eligible during global hit pause.
- Reset cadence safely on state transition and retain normal-state behavior.
- Add one deterministic fixture/trace that proves the combined wrapper runs on
  the expected pause ticks while unwrapped/non-eligible controls stay frozen.

## Acceptance

- `ignoreHitPause persistent(2) if ...` is source-located, runs during hit
  pause, and skips the intervening eligible pause tick.
- A state transition resets the bounded controller cadence; non-ZSS/CNS
  semantics do not change.
- A required trace and focused negative proof cover the interval and source
  boundary; M.U.G.E.N rejection remains located.

## Implementation evidence

- `PlayableMatchRuntime` keeps a `WeakMap` cadence per live fighter and parsed
  ZSS controller only while that fighter is in hit pause. The map resets at
  shared state entry and direct state-number mutation; CNS persistence is not
  routed through it.
- The deterministic mixed fixture starts pause from CNS state 200, runs the
  combined source-located ZSS wrapper at ticks 2 and 4, skips tick 3, then
  transitions to state 201 and proves the reset with a new wrapped execution
  on tick 5. The unwrapped ZSS `PosAdd` never runs.
- `ikemen-zss-combined-persistent-wrapper` is required in `qa:trace` with
  checksum `4ff43eb7`; the corpus passed 671/671 artifacts (637 required).

## Verification

- Focused parser/loader/runtime tests for first execution, interval skip,
  reset, hit-pause scheduling, and CNS non-regression.
- Focused ZSS suite passed 4 files / 15 tests; core runtime regression passed
  3 files / 330 tests; full suite passed 311 files / 3260 tests; typecheck
  and direct boundary check passed.
- `pnpm build` passed in 3m59s after the earlier short observation timeouts.
  Vite reports slow `vite:prepare-out-dir` work and the existing large-chunk
  advisory, but emits the complete production bundle. Targeted diff hygiene
  passed; no UI changed, so smoke remains N/A.

## Claim ceiling

Allowed: constant positive `persistent(n)` paired with `ignoreHitPause` for
the named direct character-state ZSS subset under `ikemen-go`.

Blocked: dynamic expressions, general CNS persistent parity, arbitrary ZSS
scope, new controllers, local variables/functions/loops, Lua, system ZSS,
rollback/netplay, scores, and full Ikemen parity.
