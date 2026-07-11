# Execute dynamic Tag self

Type: implementation
Status: open
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic boolean `self` without widening partner, redirect, or order semantics?

## Acceptance

- Compile supported boolean expressions into typed deferred self data.
- Resolve against caller expression context at controller execution.
- Preserve partner-sensitive omission defaults and aggregate prevalidation.
- Prove true/false, changing variable input, and malformed-expression fail-closed behavior.
- Leave dynamic partner/state/control/member/leader and redirects unsupported.
