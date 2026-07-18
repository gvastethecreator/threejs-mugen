# ADR 0014: Root State -1 Ordering Boundary

- Status: Accepted for bounded runtime scope
- Date: 2026-07-18
- Last reviewed: 2026-07-18 at HEAD `730f1a14`
- Scope: imported root actors in the playable runtime
- Implementation: [`730f1a14`](https://github.com/gvastethecreator/threejs-mugen/commit/730f1a14)
- Closeout: [`docs/reports/2026-07-18-root-state-minus-one-closeout.md`](../reports/2026-07-18-root-state-minus-one-closeout.md)
- Research: [`docs/research/2026-07-18-root-state-minus-one-ordering.md`](../research/2026-07-18-root-state-minus-one-ordering.md)

## Context

The runtime already had profile-aware root State -3 and State -2 passes, but
CMD `stateEntries` were invoked by the input-control phase. This made State -1
run before the root global passes and made a fallback attack mutate control
before command routing had its official special-state position.

Elecbyte's CNS reference defines the root special-state order as `-3`, `-2`,
`-1`, then the current state.

## Decision

Use a one-tick sampled-control boundary. Player input and simple AI are sampled
before fighter advancement and stored as a deferred control callback. The root
controller runner then executes State -1 after the existing `-3/-2` passes. If
State -1 does not route a state, the deferred callback applies the original
local/AI fallback. If the actor was blocked from sampling, the runner still
executes State -1 without applying fallback control.

The boundary is enabled for imported root definitions that declare numeric
root State -3 or State -2 in a profile that supports those passes. It reuses the existing
State -1 setup and route worlds, target-dispatch lease hooks, telemetry, and
current-state runner. Helpers, standby roots, and pause-immune-only roots do
not inherit the boundary implicitly.

## Consequences

Positive:

- root State -1 now has the documented relative position after `-3/-2`;
- command routes see the control state before fallback attack startup;
- player and AI use the same deferred ordering contract;
- pause-capable active roots use the same boundary when they can advance.

Limitations:

- this is not a full CNS virtual machine or exact controller interleaving;
- helper input buffers and helper State -1 ownership remain separate decisions;
- Common1 and multiple-source merge precedence remain unresolved;
- hitpause-only ignored-controller execution does not become State -1 parity.

## Verification contract

The closeout requires focused RuntimeInputControlSystem and PlayableMatchRuntime
tests, TypeScript 7 build, repository boundaries, redirect-boundary guard, and
diff hygiene. No compatibility score or full parity claim moves from this ADR.
