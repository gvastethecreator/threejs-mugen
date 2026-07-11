# Execute static Tag caller state

Type: implementation
Status: open
Blocked by: None

## Question

How should static non-negative caller-only `stateno` enter the caller's own state and combine with Tag standby mutation without partial failure?

## Acceptance

- Static caller-only `stateno` compiles for TagIn and TagOut.
- Omitted self defaults true; explicit static self remains bounded.
- Caller state existence validates before state or standby mutation.
- State entry uses caller-owned runtime program and clears foreign state ownership.
- Partner, partner state/control, dynamic values, and remaining options fail closed.
