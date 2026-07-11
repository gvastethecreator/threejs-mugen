# Execute dynamic Tag partner selection

Type: implementation
Status: open
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
