# Ticket 151: Dizzy Break Transition

Status: resolved

Question: can a bounded imported direct HitDef contact enter the common dizzy
state when the actor-local resource reaches zero without overriding explicit
hit-state routing or re-triggering from the zero floor?

Answer: yes, for the imported direct-hit route.

Evidence:

- Official IKEMEN-GO `common.const` defines `AnimDizzy = 5300` and
  `StateDizzy = 6565300`.
- `DizzyStateSystem` resolves that default only through an availability
  predicate, failing closed when the state is absent.
- Direct combat requests the transition only when the pre-hit resource is
  positive and the post-hit resource is zero.
- Runtime resolution preserves explicit `p2stateno`, restricts the default
  route to imported actors, and enters the available common state after
  generic get-hit handling.
- Required `synthetic-imported-dizzy-state` and focused tests pass.

Blocked: explicit `p2stateno` breadth, native transitions, helper/projectile/
team sharing, reset/persistence, HUD, rollback/netplay, and full parity.

Next: red-life `LifeShare`.
