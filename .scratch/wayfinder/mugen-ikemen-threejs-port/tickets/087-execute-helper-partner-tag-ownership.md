# Execute Helper-relative partner Tag ownership

Type: task
Status: resolved
Blocked by: None

## Question

Can root-executed explicit-IKEMEN TagIn/TagOut RedirectID mutate a live Helper locally and its Helper-relative partner root atomically without admitting member/leader or broader gameplay ownership?

## Acceptance

- Admit `partner`, optional `partnerstateno`, and TagIn `partnerctrl` for a live Helper RedirectID target.
- Keep all dynamic expression evaluation in the original root caller context and align resolution to pinned compiler/source parameter order.
- Resolve the Helper anchor through its actual `rootId`, then select a stable same-side root with existing partner ownership.
- Prevalidate Helper-local and partner-owned state availability before any standby, state, control, order, or telemetry mutation.
- Apply Helper-local state/control/self standby before partner-root standby/state/control.
- Fail closed for invalid/unresolved expressions, missing/disabled Helper root or partner, unavailable states, legacy profile, `memberno`, and `leader`.
- Cover static and dynamic partner selection, Helper-local composition, partner state/control order, TagOut behavior, standby partners, and atomic failure.
- Pass focused tests, full tests, TypeScript 7 typecheck/build, trace gates, boundaries, and diff check; no browser smoke unless visible presentation changes.

## Answer

Explicit `ikemen-go` TagIn/TagOut now admits a live Helper RedirectID with static/dynamic `partner`, `partnerstateno`, and TagIn `partnerctrl`. All deferred values resolve once in original-caller compiler order. Partner selection anchors to the Helper's exact live root and returns a stable same-side root; Helper state/control/self apply before partner standby/state/control.

The compiler now admits source-valid caller-state plus partner composition. Missing roots/partners, unavailable states, invalid expressions, and member/leader axes fail atomically without success telemetry. Verification passes 3 focused files / 211 tests, 170 files / 1727 full tests, TypeScript 7 typecheck/build, 538/538 traces, boundaries, and diff check. Full report: `docs/reports/2026-07-11-ikemen-helper-partner-tag-runtime.md`.
