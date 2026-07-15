# BindToTarget RedirectID selection research

Date: 2026-07-15

## Question

Can the root-only IKEMEN `RedirectID` path route active CNS and imported
State -1 `BindToTarget` through a live PlayerID destination without mixing
the caller's target memory with the destination's binding ownership?

## Official source basis

- [Elecbyte state-controller reference](https://elecbyte.com/mugendocs/sctrls.html)
  defines `BindToTarget` as binding the player to a position relative to a
  specified target, with optional `time`, `ID`, and position anchor values.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional PlayerID execution redirect for state
  controllers, including legacy controllers. Redirecting execution does not
  itself transfer the caller into another player's state list, and the page
  records a processing-order caveat.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html)
  defines controller ordering and the special `-1`, `-2`, and `-3`
  execution contexts. Invalid redirect expressions are treated as a
  no-mutation boundary by this port.

## Decision

Implement a bounded root-only route with two explicit identities:

1. Resolve `RedirectID` to the live root destination.
2. Use that destination's remembered target list and binding memory.
3. Preserve the authored target ID, offset, logical Z, position anchor, and
   duration from the source controller.
4. Apply the same ownership rule from active CNS and imported State -1 setup.
5. Reject invalid, negative, unavailable, disabled, destroyed, malformed,
   and legacy redirects before mutation.

Omitted `RedirectID` preserves the existing local behavior. The destination
owns the binding record; the caller does not silently lend its target memory
to the redirected controller.

## Repository findings

1. `BindToTarget` already lowers to a typed operation and the target world
   already owns target matching, offsets, logical Z, and binding lifetime.
2. Active and State -1 target dispatch share the root redirect resolver.
3. The missing seam was compiler lowering, redirectable controller
   classification, State -1 setup classification, and trace coverage.
4. No helper, projectile, team, target custom-state, or multi-target ordering
   model is needed for this bounded root-fighter slice.

## Evidence plan

Use paired required imported traces. Active routing must establish reciprocal
target memories, then prove that the redirected destination binds its
remembered target while the caller's target memory remains independent. State
-1 routing repeats this after both links exist. Assert binding lifetime,
target-link ownership, typed telemetry, and invalid RedirectID
non-mutation.

## Scope ceiling

The slice covers `ikemen-go`, live root fighters, active CNS, imported State
-1 setup, target ID filtering, position anchors, logical Z, duration, and
fail-closed RedirectID handling. Helpers, projectiles, teams,
cross-localcoord scaling, exact multi-target order, persistence,
rollback/netplay, presentation, score, and full MUGEN/IKEMEN parity remain
separate frontiers.
