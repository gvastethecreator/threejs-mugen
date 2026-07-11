# Execute dynamic TagIn partner control

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn resolve dynamic `partnerctrl` while keeping partner selection static and aggregate validation atomic?

## Acceptance

- Require existing static non-negative partner selection.
- Compile supported boolean expression into deferred partner-control data.
- Resolve before any state/order/standby mutation; apply after partner state entry.
- Prove changing variable false/true, partner StateDef precedence, and missing-target rollback.
- Leave dynamic partner ordinal/states/member/leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn now compiles supported non-static `partnerctrl` into `partnerControlExpression` only when static partner selection exists. Dispatch resolves it in caller context alongside dynamic self/caller control before any mutation, strips deferred metadata, and hands aggregate validation one concrete operation. Existing order activates/enters partner state before applying resolved partner control. Live caller variables re-evaluate each tick; missing partner blocks caller control, standby, partner control, and successful telemetry.
