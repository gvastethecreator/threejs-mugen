# Execute dynamic Tag self

Type: implementation
Status: resolved
Blocked by: None

## Question

How should TagIn/TagOut resolve dynamic boolean `self` without widening partner, redirect, or order semantics?

## Acceptance

- Compile supported boolean expressions into typed deferred self data.
- Resolve against caller expression context at controller execution.
- Preserve partner-sensitive omission defaults and aggregate prevalidation.
- Prove true/false, changing variable input, and malformed-expression fail-closed behavior.
- Leave dynamic partner/state/control/member/leader and redirects unsupported.

## Answer

TagIn/TagOut now compile supported non-static `self` values into normalized `selfExpression` while retaining a concrete placeholder only until dispatch. Runtime resolves the expression against the current caller/controller context, converts zero to false and non-zero to true, removes deferred metadata, then applies and records the concrete operation. Structural malformed input fails compilation; changing caller variables are observed on each tick. Existing partner-sensitive omission and aggregate target validation remain unchanged.
