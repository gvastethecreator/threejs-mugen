# TargetDrop RedirectID selection research

Date: 2026-07-15

## Question

Which independent root-only `Target*` family should follow the closed
TargetFacing RedirectID slice without widening target actor state, binding
lifetime, helper identity, or team ownership?

## Answer

Select `TargetDrop`. It changes only the redirected owner's remembered-target
list and already has typed compiler lowering, target-memory pruning, binding
cleanup, and target telemetry in the port. The missing boundary is the shared
root PlayerID RedirectID route plus State -1 setup classification.

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  says the optional parameter can be used with all state controllers,
  including legacy controllers, and sends controller execution to the
  designated PlayerID. It also warns that processing order can limit specific
  controllers.
- [Elecbyte TargetDrop documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `excludeID` as the target ID to retain, `keepone` as the at-most-one
  flag, and defaults `excludeID` to dropping all targets and `keepone` to one.

## Repository findings

1. `TargetDrop` already lowers to a typed operation with `excludeId` and
   `keepOne`; `RuntimeTargetWorld` owns the list/binding pruning.
2. Active target dispatch already sends all `target*` controllers through the
   shared `RuntimeTargetControllerDispatchWorld` seam.
3. `StateProgramExecutor` treats target controllers as side effects, but its
   State -1 setup allowlist currently omits `targetdrop`.
4. The redirected dispatch candidate list is only needed to refresh target
   binding-subject state after the destination list changes; it does not add
   target actor mutation or custom-state ownership.

## Bounded implementation

- profile: `ikemen-go`;
- owners: live root fighters only;
- paths: active CNS and imported State -1 setup;
- controller: `TargetDrop`;
- destination: live root selected by PlayerID;
- memory: destination target list and bindings only;
- value/ID context: preserve existing caller-owned typed `excludeId` and
  `keepOne` values;
- missing RedirectID: preserve local behavior;
- invalid, negative, unavailable, disabled, destroyed, malformed, and legacy
  redirects: fail closed before memory mutation;
- no helper, projectile, team, custom-state, target-actor, presentation,
  persistence, rollback/netplay, or score claim.

## Evidence plan

Use paired required imported traces. Active routing must create distinct target
memories, then prove the destination owner drops its target list while the
caller retains its own link. State -1 routing must prove the same destination
ownership after both reciprocal links exist. Use one retained target in the
required route; exact random selection among multiple equal IDs remains
blocked. Compiler, State -1 classification, runtime dispatch, trace presets,
and invalid RedirectID tests must cover typed lowering and fail-closed behavior.

## Remaining uncertainty

The official RedirectID page leaves its incompatible-controller list
unfinished, and Elecbyte allows random choice when `keepone` retains multiple
equal-ID targets. This slice must claim only deterministic single-retained
root target-memory pruning; it must not generalize to TargetBind, TargetState,
helpers, projectiles, teams, or exact multi-target random parity.
