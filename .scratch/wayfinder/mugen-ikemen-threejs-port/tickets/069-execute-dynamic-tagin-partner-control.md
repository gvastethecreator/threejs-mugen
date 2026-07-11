# Execute dynamic TagIn partner control

Type: implementation
Status: open
Blocked by: None

## Question

How should TagIn resolve dynamic `partnerctrl` while keeping partner selection static and aggregate validation atomic?

## Acceptance

- Require existing static non-negative partner selection.
- Compile supported boolean expression into deferred partner-control data.
- Resolve before any state/order/standby mutation; apply after partner state entry.
- Prove changing variable false/true, partner StateDef precedence, and missing-target rollback.
- Leave dynamic partner ordinal/states/member/leader, redirects, and gameplay ownership unsupported.
