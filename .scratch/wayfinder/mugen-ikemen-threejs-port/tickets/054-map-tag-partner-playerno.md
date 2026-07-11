# Map Tag partner and PlayerNo identity

Type: research
Status: open
Blocked by: None

## Question

What stable PlayerNo/member identity contract is required before TagIn/TagOut can target `partner` without confusing root ids, team order, leader identity, or helper ids?

## Acceptance direction

- Pin partner/playerno semantics to official IKEMEN source.
- Reconcile root ids P1-P8 with authored PlayerNo and team member order.
- Invalid, cross-side, helper, disabled, and duplicate targets fail closed.
- No leader/member-order or gameplay ownership mutation in the first partner cut.
