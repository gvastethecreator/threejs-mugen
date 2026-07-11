# Execute dynamic Tag partner selection

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic `partner` ordinals while preserving caller-relative identity, omission defaults, and aggregate validation?

## Acceptance

- Compile supported integer expressions into deferred partner-ordinal data.
- Preserve omitted-self behavior based on authored partner presence, not unresolved value.
- Resolve in caller context before target/state/order/control mutation.
- Select the cyclic same-side root through the existing partner world.
- Prove variable-selected partner plus negative/missing-target rollback and optional partner-state composition.
- Leave dynamic member/leader, redirects, and gameplay ownership unsupported.

## Answer

TagIn/TagOut now compile supported non-static `partner` into `partnerOrdinalExpression`; authored partner presence keeps omitted `self` false before the ordinal is known. Dispatch resolves in live caller context, truncates toward zero, rejects negative values, strips deferred metadata, and sends the concrete ordinal through the existing cyclic same-side selection and aggregate validation path. A same-tick `var(0) + 0.9` selects P5 and composes with partner-owned state/control; TagOut preserves omitted-self behavior. Negative values, absent teammates, unavailable selected-partner states, malformed tuples, and empty values fail before mutation or successful telemetry.
