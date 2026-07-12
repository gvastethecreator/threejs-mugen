# Execute Helper-relative Tag member position-one ownership

Type: task
Status: open
Blocked by: None

## Question

Can explicit-IKEMEN TagIn/TagOut RedirectID reproduce the pinned Helper `memberno` position-one quirk without pretending the Helper owns its root's mutable member position?

## Acceptance

- Admit static and deferred `memberno` for a live Helper RedirectID only under explicit Tag mode.
- Resolve one-based member position in the original root caller context and reject values below one.
- Anchor team side through the Helper's exact live root, but swap from mutable position one regardless of that root's current order.
- Add an explicit Tag-order operation for position-one swaps; do not synthesize Helper membership or mutate stable root slots.
- Prevalidate Helper, optional partner, state, member position, and optional leader before every mutation.
- Apply Helper state, member-order swap, Helper control, optional leader rotation, Helper self standby, then optional partner-root standby/state/control.
- Fail closed for invalid/out-of-range/non-Tag results, missing/disabled root, unavailable states, and legacy profile.
- Cover static/dynamic TagIn/TagOut, a root whose mutable position differs from one, full composition, rollback, stable slots, and reset determinism.
- Pass focused/full tests, TypeScript 7 typecheck/build, trace gates, boundaries, and diff check; no browser smoke unless visible presentation changes.

## Answer

Pending implementation.
