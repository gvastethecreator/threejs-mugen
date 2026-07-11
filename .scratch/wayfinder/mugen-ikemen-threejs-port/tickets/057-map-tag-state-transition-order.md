# Map Tag state transition order

Type: research
Status: open
Blocked by: None

## Question

How do static `stateno` and `partnerstateno` interact with Tag standby mutation, state ownership, control, and failure ordering in pinned IKEMEN source?

## Acceptance

- Pin exact TagIn/TagOut state-transition defaults and execution order.
- Separate caller state ownership from partner state ownership.
- Define atomic/fail-closed behavior for missing states or targets.
- Bound the next executable subset without granting gameplay ownership.
