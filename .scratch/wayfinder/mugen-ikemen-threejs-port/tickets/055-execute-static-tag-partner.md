# Execute static Tag partner selection

Type: implementation
Status: resolved
Blocked by: None

## Question

How should static non-negative `partner` compile and execute with IKEMEN cyclic same-side root semantics while all other optional Tag parameters stay blocked?

## Acceptance

- Static partner ordinal compiles into typed Tag operation.
- Partner-only form does not mutate caller standby.
- Ordinals select/wrap stable same-side roots and exclude helpers/opponents.
- Negative, dynamic, missing-target, and mixed unsupported params fail closed.
- Same-tick selection refresh remains observable; gameplay ownership stays unchanged.

## Answer

Static non-negative `partner` compiles into a typed partner-only Tag operation. `RuntimeTagPartnerSelectionWorld` selects the caller-relative cyclic same-side root from stable P1/P3/P5/P7 or P2/P4/P6/P8 order and excludes helpers/opponents. Runtime mutates only the selected partner; missing targets fail closed without telemetry. Dynamic, negative, and mixed unsupported parameters remain rejected.
