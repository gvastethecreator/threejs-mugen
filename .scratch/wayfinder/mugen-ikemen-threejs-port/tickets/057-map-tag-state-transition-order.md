# Map Tag state transition order

Type: research
Status: resolved
Blocked by: None

## Question

How do static `stateno` and `partnerstateno` interact with Tag standby mutation, state ownership, control, and failure ordering in pinned IKEMEN source?

## Acceptance

- Pin exact TagIn/TagOut state-transition defaults and execution order.
- Separate caller state ownership from partner state ownership.
- Define atomic/fail-closed behavior for missing states or targets.
- Bound the next executable subset without granting gameplay ownership.

## Answer

Pinned IKEMEN compiles Tag parameters in a fixed controller-specific order. Caller `stateno` calls `changeState` on the redirected caller before standby adjustment and makes omitted `self` default true. Partner standby changes first, then `partnerstateno` changes the selected partner in its own state table. TagOut `partnerstateno` alone suppresses the caller default but cannot change state without `partner`. The next bounded subset is static non-negative caller-only `stateno`, with no partner options and local state prevalidation; partner state/control remain separate because their partial-mutation order conflicts with the sandbox atomic transition contract.
