# Map Helper aggregate Tag ownership

Type: research
Status: resolved
Blocked by: None

## Question

When a root TagIn/TagOut RedirectID selects a Helper, how do `partner`, `partnerstateno`, `partnerctrl`, `memberno`, and `leader` cross from Helper-local mutation into inherited root-team ownership and ordering?

## Acceptance

- Pin official wiki and pinned Ikemen-GO compiler/runtime source for Helper-relative aggregate Tag parameters.
- Determine target selection, inherited PlayerNo/team ownership, member/leader order, state/control/standby mutation order, and failure timing.
- Audit current character identity, root selection, Tag team order, Helper redirect, state/control, and telemetry boundaries locally.
- Keep Helper-originated Tag, Helper-created Helpers, gameplay/round/resource ownership, incoming Helper interaction breadth, and exact incremental failure out of scope.
- Produce a source-backed research note and one bounded implementation ticket only if the semantics and local owner are clear.

## Answer

Pinned Ikemen-GO establishes a split target. Helper `stateno`, TagIn `ctrl`, and self standby stay Helper-local. `partner` selects a same-side root from the Helper's inherited stable PlayerNo and applies partner standby/state/control after Helper-local effects. `memberno` and TagIn `leader` mutate root Tag order; Helpers retain zero-valued `memberNo`, so Helper `memberno` swaps from mutable position one, while leader uses stable same-side PlayerNo. All expressions remain original-caller-owned.

Upstream applies immediate effects incrementally and does not roll them back after later parameter failure. The local bounded runtime will retain prevalidated atomicity. Wayfinder 087 admits only Helper-relative partner mutation; member and leader remain blocked for dedicated cuts. Full evidence: `docs/research/2026-07-11-ikemen-helper-aggregate-tag-ownership.md`.
