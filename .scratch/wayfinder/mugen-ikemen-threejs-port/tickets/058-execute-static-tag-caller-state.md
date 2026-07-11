# Execute static Tag caller state

Type: implementation
Status: resolved
Blocked by: None

## Question

How should static non-negative caller-only `stateno` enter the caller's own state and combine with Tag standby mutation without partial failure?

## Acceptance

- Static caller-only `stateno` compiles for TagIn and TagOut.
- Omitted self defaults true; explicit static self remains bounded.
- Caller state existence validates before state or standby mutation.
- State entry uses caller-owned runtime program and clears foreign state ownership.
- Partner, partner state/control, dynamic values, and remaining options fail closed.

## Answer

Static non-negative caller-only `stateno` compiles as `callerStateNo`. Runtime validates the state against the caller's own program before mutation, enters with foreign ownership cleared, then applies the existing standby transition. Omitted self remains true; `self = 0` performs state-only entry. Missing state blocks both state and standby without successful telemetry. Partner plus caller state and every other optional axis remain unsupported.
