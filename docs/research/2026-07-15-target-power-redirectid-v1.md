# TargetPowerAdd RedirectID v1 research

Date: 2026-07-15

## Question

What does IKEMEN RedirectID change for TargetPowerAdd, and what is the
smallest runtime slice that can be implemented without claiming general
target, helper, projectile, or team parity?

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  identifies RedirectID as an IKEMEN extension for redirecting controller
  ownership to a player identity.
- [Pinned IKEMEN system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  provides the engine-side target-power controller entry point used for the
  compatibility comparison.
- [Pinned IKEMEN character source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
  contains the target lookup and target-power mutation path. The relevant
  ownership observation is that target power is changed through the selected
  actor's remembered target collection.
- [Elecbyte state-controller documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines the MUGEN baseline for TargetPowerAdd: it adds power to targets
  selected by the controller, with an optional target id.

## Findings

1. TargetPowerAdd is a target-memory mutation, not a direct mutation of the
   controller caller's power pool.
2. IKEMEN RedirectID changes the actor whose target memory is used. The
   redirected actor therefore applies the amount to its remembered target.
3. The RedirectID value and the controller amount must be evaluated in the
   caller context before dispatch. Redirecting ownership must not silently
   change expression context.
4. The runtime's stable root PlayerID registry is the correct bounded
   destination lookup. PlayerNo is not interchangeable with PlayerID: the
   two-root fixture uses PlayerID 57 for the second root.

## Bounded implementation decision

Entry 549 implements only the following contract:

- profile: ikemen-go;
- owner class: live root fighters;
- execution path: active CNS controllers;
- controller family: TargetPowerAdd;
- destination: a live root PlayerID target memory;
- target candidate: the destination's remembered target, with the active
  opponent available for the fixture route;
- invalid, unavailable, disabled, destroyed, negative, empty, and legacy
  redirects: fail closed before mutation;
- missing RedirectID: preserve local controller behavior.

The compiler preserves a validated RedirectID expression on the typed target
operation. The runtime resolves the destination with the caller's expression
context, then executes target-power mutation against the destination target
world. Imported telemetry is mirrored only for the bounded non-imported demo
destination path.

## Evidence

The implementation and focal tests are in
src/mugen/compiler/ControllerOps.ts,
src/mugen/runtime/PlayableMatchRuntime.ts,
src/mugen/runtime/RuntimeTraceGatePresets.ts,
src/tests/RuntimeCompiler.test.ts,
src/tests/PlayableMatchRuntime.test.ts, and
src/tests/RuntimeTraceGatePresets.test.ts.

The required trace synthetic-imported-target-power-redirect proves:

- imported caller and target actors execute the route;
- TargetPowerAdd and HitDef controller/operation telemetry are present;
- both target links survive;
- the redirected destination's remembered target reaches power 75;
- the caller's power remains 35;
- the gate checksum is bf1cb5ce.

## Limits and follow-up

State-entry setup, persistent-controller timing, helper and projectile target
memory, neutral identity, team/simul aggregation, rollback/netplay, exact
upstream target selection breadth, presentation, and full MUGEN/IKEMEN parity
are intentionally outside this entry. The next slice must be selected as an
independent target-family boundary and must add its own imported trace before
any parity claim is expanded.
