# Map Tag partner and PlayerNo identity

Type: research
Status: resolved
Blocked by: None

## Question

What stable PlayerNo/member identity contract is required before TagIn/TagOut can target `partner` without confusing root ids, team order, leader identity, or helper ids?

## Acceptance direction

- Pin partner/playerno semantics to official IKEMEN source.
- Reconcile root ids P1-P8 with authored PlayerNo and team member order.
- Invalid, cross-side, helper, disabled, and duplicate targets fail closed.
- No leader/member-order or gameplay ownership mutation in the first partner cut.

## Answer

Tag `partner` is a caller-relative cyclic same-side root offset, not absolute PlayerNo or memberNo. `0` selects the next teammate. Selection uses side-interleaved root slots, wraps by team size, excludes helpers, and fails closed when no valid root exists. See `docs/research/2026-07-11-ikemen-tag-partner-selection.md`.
