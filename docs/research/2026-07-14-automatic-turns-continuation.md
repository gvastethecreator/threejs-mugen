# Research: Automatic Turns Continuation

## Question

What official IKEMEN boundary must the port reproduce when a Turns member is
KO'd, a reserve member is available, and the fight must continue without
pretending that the replacement is a new numbered round?

## Official Boundary

The official [IKEMEN-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1)
declares the match modes, including `TM_Turns`, owns side wins/draws and
`roundsExisted`, and routes `nextRound()` through state 5900. Its round-end
branch distinguishes an ordinary next round from the Turns path that prepares
the next character and restarts the fight. The source also owns
`turnsRecoveryRate`; that policy is not silently inferred by this port.

The official [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1)
holds per-character runtime/team fields and the character scheduling path. The
official [Character features](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
and [new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
document the surrounding team/state surface, while the [changed controller
reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
records compatibility differences that must remain explicit.

## Findings

- Turns continuation is an actor handoff inside the match flow, not a normal
  numbered-round increment.
- The defeated root must remain identifiable after the transition; replacing
  the object behind `p2` would erase authored vars, team state, and diagnostics.
- State 5900 is a real availability boundary. A missing incoming state cannot
  be papered over by entering a synthetic state and still claiming imported
  compatibility.
- The reset must separate transient red life from bounded life/power/guard/
  dizzy state and preserve the active match context.
- The port needs a visible plan/result so diagnostics can distinguish
  round-not-over, replacement-required, side-defeat, and blocked preflight.

## Decision

`RuntimeTurnsContinuation/v0` composes four existing owners: team decision,
team handoff, round resource reset, and state-5900 preflight. The production
runtime invokes it only after the KO/post-round clock is complete. A ready
plan commits the typed outgoing/incoming changes, preserves vars/fvars and the
current round context, resets resources, selects the next active root per side
by stable player identity, enters state 5900 where available, and resumes the
active-pair presentation/runtime path.

The defeated actor keeps life `0` in this replacement reset. The surviving
side keeps a bounded positive life value. All roots remain addressable in the
runtime registry and reserve projection; only the active pair owns normal
gameplay motion after continuation.

## Evidence

- `RuntimeTurnsContinuationWorld` focal tests cover ready, missing-state, and
  side-defeat plans.
- `PlayableMatchRuntime` covers the real KO/post-round delay, automatic
  replacement, active root IDs `p1/p4`, state 5900 entry, reserve projection,
  and fail-closed missing state 5900.
- The required imported team trace exercises the automatic route with checksum
  `4ec7e0a3` and final checksum `21bc628b`.
- `pnpm qa:trace` passes 600/600 artifacts: 566 required and 34 optional.
- The broad gate passes 208 test files / 2107 tests, TypeScript 7, a
  288-module build, boundaries, CSS budget, and core desktop/mobile Runtime
  plus Studio smoke under
  `.scratch/qa/qa-smoke-automatic-turns-continuation-core/`.
- The optional Code Fu Man browser `upper_x` path remains flaky, while its
  deterministic five-test fixture suite passes.

## Claim Ceiling

The evidence supports a bounded two-side Turns continuation over the current
runtime roster and an observable state-5900 boundary. It does not establish
official recovery-rate behavior, complete entrant sequencing for every roster
shape, winpose/motif choreography, rollback/netplay, or full MUGEN/IKEMEN
parity. The official common constants remain a separate source-backed gate;
see [common.const](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/data/common.const).
