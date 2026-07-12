# Execute Helper-originated self Tag standby

Type: task
Status: open
Blocked by: None

## Question

Can an active or standby Helper execute its own unredirected TagIn/TagOut self standby through the existing Helper CNS scheduler without widening aggregate or active-root gameplay ownership?

## Acceptance

- Route typed Helper-owned `team-standby` through an explicit Helper/match hook only under the `ikemen-go` profile.
- Admit parameter omission plus static/deferred `self`; evaluate deferred values once in the Helper's own live expression context.
- TagOut sets and TagIn clears the calling Helper standby flag when self is true/default; self false succeeds without standby mutation only when source semantics admit the authored operation.
- Reject RedirectID, partner, caller/partner state, caller/partner control, member, and leader for this first Helper-caller slice.
- Preserve Helper CNS/state time, identity, targets, projectiles, snapshots, and presentation while standby; project effective control false and suppress direct HitDef until TagIn.
- Record successful controller/`team-standby` telemetry through existing Helper owner/state context; blocked routes record no success.
- Fail closed for invalid expressions, removed/disabled Helpers, unsupported aggregate axes, legacy profile, and reset lifecycle.
- Cover default/static/deferred TagIn/TagOut, same-tick interaction ordering, standby CNS re-entry, telemetry, aggregate rejection, lifecycle, legacy, and reset.
- Pass focused/full tests, TypeScript 7 typecheck/build, trace gates, boundaries, and diff check; no browser smoke unless visible presentation changes.

## Answer

Pending implementation.
