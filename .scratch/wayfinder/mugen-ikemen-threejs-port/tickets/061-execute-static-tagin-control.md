# Execute static TagIn control

Type: implementation
Status: resolved
Blocked by: None

## Question

How should exact static TagIn `ctrl` and `partnerctrl` apply after state entry while preserving atomic target/state validation?

## Acceptance

- Exact static `ctrl = 0|1` compiles only for TagIn and implies caller self when omitted.
- Exact static `partnerctrl = 0|1` requires static partner selection.
- Caller and partner control apply after their respective state entries.
- Missing target/state leaves standby, state, and control unchanged.
- Dynamic/invalid control, TagOut control, redirects, member/leader order, and gameplay fail closed.

## Answer

Exact static TagIn `ctrl` and `partnerctrl` compile into optional caller/partner control booleans. Caller control implies self only when self is omitted; partner control requires static partner. Runtime validates caller state, partner, and partner state before mutation, then applies caller state/control, standby, partner state/control in official precedence. Missing target/state leaves standby, state, and control unchanged. Invalid/dynamic control, TagOut control, redirects, member/leader order, and gameplay fail closed.
