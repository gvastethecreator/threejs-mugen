# Execute dynamic Tag caller state

Type: implementation
Status: open
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic caller `stateno` while preserving own-state availability and aggregate validation?

## Acceptance

- Compile supported integer expressions without static partner selection.
- Resolve in caller context before all Tag mutations and reject negative/unavailable states.
- Preserve caller state before control/order/standby effects.
- Prove changing variable state selection and unavailable-state rollback.
- Leave dynamic partner ordinal/state/member/leader, redirects, and gameplay ownership unsupported.
