# Execute Helper-local Tag redirect state and control

Type: implementation
Status: resolved
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

## Answer

`PlayableMatchRuntime` now distinguishes a live Helper identity after redirect-first global PlayerID lookup. The Helper branch rejects aggregate partner/member/leader axes, resolves explicit `self` in the original root caller context, and only proceeds when it resolves false. It then resolves and validates Helper-local state before TagIn control, preserving original-caller expression ownership and aggregate no-partial-mutation behavior.

`HelperSystem` owns an atomic state/control mutation boundary. State availability is checked against the Helper's current runtime program, state metadata applies first, and explicit TagIn control overrides it afterward. Static and dynamic TagIn plus state-only TagOut are covered end to end; unsupported standby/default self, aggregate axes, unavailable state, removed/disabled identity, and legacy profile leave the Helper unchanged and emit no success telemetry. Successful telemetry remains attached to the original root caller with concrete RedirectID.
