# Execute self TagIn and TagOut

Type: implementation
Status: open
Blocked by: None

## Question

How should parameterless self TagIn/TagOut compile and execute as typed standby mutations while same-tick root selection stays live?

## Acceptance

- Parameterless TagIn/TagOut compile to typed standby operations.
- Any optional parameter fails closed for this bounded route.
- P3 TagIn and active-root TagOut mutate only their caller.
- Later root controllers in the same tick observe refreshed Enemy/P2 selection.
- Input/combat/round/presentation/resource ownership remains unchanged.
