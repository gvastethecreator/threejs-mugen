# DA29-071 research notes

Wave 7 · revision 119e627410a4

## Cut

Inventory Three.js object and resource ownership. Depends on DA29-002.

## Acceptance ceiling

Scene tree maps geometry, material, texture, render target, audio node, cache, creator, disposer, reset, route, and leak risk.

## Risk

Missed shared resource can leak or double-dispose. Allows ownership inventory only.

## Inventory method

Machine-generated closeout from `docs/MASTER_REVIEW_ROADMAP.md` + series registry.
This note records the research claim only; it does not authorize runtime, score,
or formal/global movement.

## Open questions

- Source pin freshness for any normative claim in this cut
- Fixture ownership if later implementation IDs consume this research
