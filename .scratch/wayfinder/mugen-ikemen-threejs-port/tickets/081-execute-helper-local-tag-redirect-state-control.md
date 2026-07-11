# Execute Helper-local Tag redirect state and control

Type: implementation
Status: claimed
Blocked by: None

## Question

How can root-executed TagIn/TagOut RedirectID safely mutate a live Helper's local state/control without prematurely claiming Helper standby, partner, or team-order parity?

## Acceptance

- Resolve a registered live Helper PlayerID before every later Tag expression and keep later expression evaluation in the original root caller context.
- Admit only explicit `self = 0`, no partner/member/leader/partner-state/partner-control, and the source-backed local axes: TagIn `stateno`/`ctrl`, TagOut `stateno`.
- Validate the requested state against the Helper's current runtime program and apply state metadata before explicit TagIn control.
- Reject default/true self, unsupported aggregate axes, invalid state, stale/destroyed/disabled Helper, legacy profile, and malformed redirect without partial mutation or successful telemetry.
- Prove same-tick redirected state/control, original-caller dynamic expressions, state-before-control order, exact blocked routes, root behavior preservation, and deterministic lifecycle lookup.
- Keep Helper standby, partner/root mutation, member/leader order, Helper-originated Tag controllers, custom state ownership, combat/presentation participation, and exact incremental IKEMEN mutation unsupported.
