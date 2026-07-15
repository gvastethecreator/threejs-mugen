# TargetFacing RedirectID selection research

Date: 2026-07-15

## Question

Which next independent root-only `Target*` family should extend the closed
TargetLifeAdd, TargetPowerAdd, and TargetVelAdd/TargetVelSet RedirectID slices?

## Answer

Select `TargetFacing` for the next bounded implementation. It reuses existing
target-memory lookup and target ID filtering, but mutates only target facing;
it does not introduce binding lifetime, custom-state ownership, helper
identity, or team aggregation.

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  says RedirectID can be used with all state controllers, sends execution to
  the designated PlayerID, and warns that processing order can limit specific
  controllers.
- [Elecbyte TargetFacing documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines positive `value` as matching the executing player's facing,
  negative `value` as the opposite facing, and optional `ID` filtering.

## Repository findings

1. `TargetFacing` already lowers into a typed target operation with `value`
   and `requestedId`; only RedirectID ownership is missing.
2. `TargetSystem` already applies the operation to each remembered target
   using the current target owner as the direction source.
3. Active and State -1 target dispatch already share the same root PlayerID
   redirect seam used by the closed resource and velocity families.

## Bounded implementation

- profile: `ikemen-go`;
- owners: live root fighters only;
- paths: active CNS and imported State -1 setup;
- controller: `TargetFacing`;
- destination: live root selected by PlayerID;
- target: destination remembered target filtered by authored `ID`;
- value: caller-owned typed facing expression;
- missing RedirectID: preserve local behavior;
- invalid, negative, unavailable, disabled, destroyed, malformed, and legacy
  redirects: fail closed before mutation;
- no helper, projectile, team, binding, target-state, persistence,
  rollback/netplay, presentation, or score claim.

## Evidence plan

Use paired required imported traces. Active routing must prove the destination
owner changes its remembered target's facing while the caller's target memory
would select the other fighter. State -1 routing must prove the same ownership
boundary after both reciprocal target memories exist. Compiler, state-entry
classification, runtime, trace-preset, and invalid RedirectID tests must cover
typed lowering and fail-closed behavior.

## Remaining uncertainty

IKEMEN documents RedirectID broadly but leaves its incompatible-controller list
unfinished. The implementation must claim only root TargetFacing and preserve
the existing target-world facing contract; it must not generalize to
TargetBind, TargetState, helpers, or teams.
