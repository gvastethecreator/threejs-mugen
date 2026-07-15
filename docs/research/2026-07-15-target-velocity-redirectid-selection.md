# TargetVelAdd/TargetVelSet RedirectID selection research

Date: 2026-07-15

## Question

Which independent `Target*` family should follow the closed root-only
`TargetLifeAdd` and `TargetPowerAdd` RedirectID slices?

## Answer

Select the velocity pair: `TargetVelAdd` and `TargetVelSet`. They share target
memory lookup, target-id filtering, and signed x/y velocity semantics, while
remaining independent from resource mutation, target state entry, binding, and
team ownership.

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  says the optional parameter routes a state-controller execution to a
  designated PlayerID, while warning that processing order can limit some
  controllers.
- [Elecbyte TargetVelAdd documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines additive target velocity, target-facing x direction, downward y
  direction, optional x/y values, and optional target `ID` filtering.
- [Elecbyte TargetVelSet documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines replacement target velocity with the executing player's x direction,
  downward y direction, optional x/y values, and optional `ID` filtering.

## Repository findings

1. `ControllerOps` already lowers both controllers into typed target
   operations, so RedirectID can preserve authored x/y values without a new
   parameter parser.
2. `RuntimeTargetControllerDispatchWorld` already routes target operations
   through the selected actor's `RuntimeTargetWorld`; the missing piece is
   root PlayerID ownership in active and State -1 dispatch.
3. `TargetVelAdd` already uses the target's facing for x. `TargetVelSet` uses
   the executing target-owner actor's facing for x in the current target-world
   contract, matching the source controller's "player" wording; the redirect
   destination therefore becomes the velocity-set direction owner.

## Bounded implementation

- profile: `ikemen-go`;
- owners: live root fighters only;
- paths: active CNS and imported State -1 setup;
- controllers: `TargetVelAdd`, `TargetVelSet`;
- destination: live root selected by PlayerID;
- target: destination remembered target filtered by authored `ID`;
- values: caller-owned typed x/y expressions and optional `ID`;
- missing RedirectID: preserve local behavior;
- invalid, negative, unavailable, disabled, destroyed, malformed, and legacy
  redirects: fail closed before mutation;
- no helper, projectile, team, binding, target-state, persistence,
  rollback/netplay, presentation, or score claim.

## Evidence delivered

The implementation uses paired required imported traces so active CNS and State
-1 scheduling remain independently observable:

- `synthetic-imported-target-velocity-redirect` / `4f62267d` covers active
  `TargetVelAdd` and `TargetVelSet` routing, target links, velocity mutation,
  and destination-owned controller telemetry.
- `synthetic-imported-target-velocity-state-entry-redirect` / `dedf1499` covers
  State -1 setup routing, target links, y-velocity mutation, and typed
  controller/operation telemetry.

Focused compiler, runtime, and trace-preset tests cover typed RedirectID,
invalid fail-closed behavior, and the current destination-owned
`TargetVelSet` direction contract. Full trace QA records both artifacts as
required; this slice does not generalize RedirectID compatibility to other
Target* controllers.

## Remaining uncertainty

IKEMEN documents RedirectID as broadly available but leaves a controller
compatibility list unfinished. The trace therefore claims only this root-only
pair and does not generalize to the remaining `Target*` controllers.
