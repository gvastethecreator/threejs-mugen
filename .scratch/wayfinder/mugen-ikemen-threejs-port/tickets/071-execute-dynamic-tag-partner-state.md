# Execute dynamic Tag partner state

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic `partnerstateno` while partner identity remains static and state ownership stays local to that partner?

## Acceptance

- Require static non-negative partner selection.
- Compile supported integer expressions into deferred partner-state data.
- Resolve in caller context before all mutation; validate against partner-owned program.
- Preserve partner standby before state entry and partner control after state entry.
- Prove variable-selected state plus negative/unavailable/missing-partner rollback.
- Leave dynamic partner ordinal/member/leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn/TagOut now compile supported non-static `partnerstateno` into `partnerStateExpression` while requiring a static non-negative partner ordinal. Dispatch evaluates the expression in live caller context, truncates to an integer, rejects negative results, strips deferred metadata, and then validates the selected partner's own state program before any Tag effect. Same-tick VarSet selects partner-owned state 200 for TagIn and TagOut; partner control still applies after state entry. Negative, unavailable, or missing-partner results preserve caller/partner state, control, standby, and successful telemetry.
