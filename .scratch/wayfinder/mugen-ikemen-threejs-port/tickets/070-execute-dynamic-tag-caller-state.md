# Execute dynamic Tag caller state

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic caller `stateno` while preserving own-state availability and aggregate validation?

## Acceptance

- Compile supported integer expressions without static partner selection.
- Resolve in caller context before all Tag mutations and reject negative/unavailable states.
- Preserve caller state before control/order/standby effects.
- Prove changing variable state selection and unavailable-state rollback.
- Leave dynamic partner ordinal/state/member/leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn/TagOut now compile supported non-static caller `stateno` into `callerStateExpression`. Dispatch resolves in caller context, applies IKEMEN-style integer truncation, rejects negative results, strips deferred metadata, and only then enters aggregate target/state validation. Same-tick VarSet selects an owned caller state; explicit control still applies after entry. Negative or unavailable resolved states preserve state, standby, all other Tag effects, and successful telemetry.
