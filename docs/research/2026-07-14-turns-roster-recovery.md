# Research: Turns Roster and Recovery

## Question

Which official IKEMEN facts must remain explicit when a Turns fight promotes
more than one reserve member and the surviving character receives between-entry
life recovery?

## Official Findings

- The official [IKEMEN-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1)
  declares `TM_Turns`, the default `turnsRecoveryRate = 1.0 / 300`, and the
  state-5900 boundary used by `nextRound()`.
- The same source applies fallback Turns recovery only to a living winner,
  while the round is not match-over and time remains. Its formula is
  `(lifeMax * timeTicks / 60) * turnsRecoveryRate`, clamped to `lifeMax`.
  External Lua/configuration can own a different policy, so this port exposes
  the fallback as an explicit bounded contract rather than claiming every
  configuration.
- The official [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1)
  keeps `memberNo`, `playerNo`, team state, and standby/disabled flags as
  distinct identity facts. The loader and Turns promotion path use member
  order and a hidden standby slot, then promote the next member into the
  active side slot.
- The official [Character features](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
  and [state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  document the surrounding team/state surface; they do not make a synthetic
  active alias equivalent to an imported character identity.

## Decision

`RuntimeTurnsRecoveryWorld/v0` models the official fallback formula with the
actual remaining round timer ticks, winner identity, life maxima, clamping, and
terminal-match guard. `RuntimeTurnsContinuation/v0` now publishes that result
before resource reset.

The continuation plan also publishes `RuntimeTurnsRoster/v0`: ordered actor
IDs, current active roots, standby roots, defeated roots, the next candidate,
and remaining candidates per side. A promoted reserve root is no longer marked
replacement-eligible while active; it becomes eligible again only as a healthy
standby member.

## Evidence

- `RuntimeTurnsRecoverySystem.test.ts` proves the official default rate,
  remaining-tick formula, clamping guard, and terminal-match suppression.
- `RuntimeTurnsContinuationSystem.test.ts` proves `p4` promotion followed by
  the next ordered `p6` promotion, winner recovery before resource reset, and
  roster diagnostics for three members per side.
- `PlayableMatchRuntime.test.ts` proves the production automatic route exposes
  recovery and roster facts alongside state 5900 and active `p1/p4` roots.
- The Entry 520 broad gate passes 209 test files / 2110 tests, TypeScript 7, a
  289-module build, boundaries, CSS budget, 600/600 traces, and core
  desktop/mobile Runtime plus Studio smoke under
  `.scratch/qa/qa-smoke-turns-roster-recovery-core/`. The optional Code Fu Man
  `upper_x` browser failure remains outside this runtime boundary.

## Claim Ceiling

This establishes a bounded source-backed fallback recovery policy and ordered
multi-entrant roster read model. It does not claim external-Lua recovery,
preloaded Turns asset replacement, exact winpose/motif choreography, score
semantics for every survival mode, rollback/netplay, or full
MUGEN/IKEMEN parity.
