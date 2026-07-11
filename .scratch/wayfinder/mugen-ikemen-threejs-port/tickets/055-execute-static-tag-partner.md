# Execute static Tag partner selection

Type: implementation
Status: open
Blocked by: None

## Question

How should static non-negative `partner` compile and execute with IKEMEN cyclic same-side root semantics while all other optional Tag parameters stay blocked?

## Acceptance

- Static partner ordinal compiles into typed Tag operation.
- Partner-only form does not mutate caller standby.
- Ordinals select/wrap stable same-side roots and exclude helpers/opponents.
- Negative, dynamic, missing-target, and mixed unsupported params fail closed.
- Same-tick selection refresh remains observable; gameplay ownership stays unchanged.
