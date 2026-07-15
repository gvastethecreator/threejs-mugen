# TargetState RedirectID selection

Date: 2026-07-15

## Question

Can the root-only IKEMEN `RedirectID` path route active CNS and imported
State -1 `TargetState` through a live `PlayerID` destination without mixing
the caller's target memory with custom-state ownership?

## Official basis

- [Elecbyte state-controller reference](https://elecbyte.com/mugendocs/sctrls.html)
  defines `TargetState` with the required `value = state_no` parameter and the
  optional `ID = target_id` filter. Without an ID, the controller addresses all
  remembered targets.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) defines
  top-to-bottom controller evaluation and the special `-1`, `-2`, and `-3`
  state-controller contexts.
- [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional PlayerID execution redirect for state
  controllers, including legacy controllers. The redirect does not itself
  transfer the caller into another player's state list; `ChangeState` and
  `SelfState` redirected to another owner also do not stop the current state's
  code.

## Decision

Implement a bounded root-only route with two explicit identities:

1. Resolve `RedirectID` to the live root destination and execute the
   controller against that destination's target memory.
2. Keep the controller's `ID`/target filter and `value` state number intact.
3. When the controller enters custom state, use the redirected destination as
   `stateOwner` and the selected target as the actor receiving that state.
4. Run the same ownership rule from active CNS and imported State -1 setup.
5. Reject invalid, negative, unavailable, disabled, destroyed, malformed, and
   legacy redirects before mutation.

This means a State -1 caller can redirect to root `PlayerID 56`, select the
target remembered by that destination, and put that selected actor into state
data owned by root 56. It deliberately does not reuse the caller's target
memory after redirect resolution.

## Executable boundary

- Active trace: root `PlayerID 57` owns the custom state while the selected
  target keeps reciprocal target links and returns through `SelfState`.
- State -1 trace: root `PlayerID 56` owns the custom state selected from its
  own target memory, with a `VarSet` one-shot gate and the same return route.
- Focal runtime tests cover compiler lowering, active dispatch, State -1
  classification, owner-backed custom-state entry, and invalid RedirectID
  fail-closed behavior.

Helpers, projectiles, teams, cross-localcoord scaling, exact multi-target
ordering, persistence, rollback/netplay, presentation, score, and full
MUGEN/IKEMEN parity remain outside this slice.
