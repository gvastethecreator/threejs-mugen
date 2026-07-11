# Execute dynamic Tag partner state

Type: implementation
Status: open
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
