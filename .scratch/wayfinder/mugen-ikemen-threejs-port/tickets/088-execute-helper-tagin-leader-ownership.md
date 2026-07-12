# Execute Helper-relative TagIn leader ownership

Type: task
Status: open
Blocked by: None

## Question

Can root-executed explicit-IKEMEN TagIn RedirectID rotate a Helper-relative stable root leader while preserving local atomicity and existing Helper/partner mutation order?

## Acceptance

- Admit static and deferred TagIn `leader` only for a live Helper RedirectID under explicit Tag mode.
- Resolve leader PlayerNo in the original root caller context and validate a stable same-side live root through the Helper's exact root anchor.
- Prevalidate Helper, optional partner, state, and leader targets before every mutation.
- Apply Helper-local state/control, leader rotation, Helper self standby, then optional partner-root standby/state/control.
- Preserve stable PlayerNo/root slots, existing dead-member sinking, telemetry ownership, and deterministic reset.
- Fail closed outside Tag mode and for invalid/opposing/missing/disabled leaders, missing Helper root, TagOut leader, and every `memberno` route.
- Cover static/dynamic leader, combined local/self/partner behavior, failure rollback, and unchanged stable slots.
- Pass focused/full tests, TypeScript 7 typecheck/build, trace gates, boundaries, and diff check; no browser smoke unless visible presentation changes.

## Answer

Pending implementation.
