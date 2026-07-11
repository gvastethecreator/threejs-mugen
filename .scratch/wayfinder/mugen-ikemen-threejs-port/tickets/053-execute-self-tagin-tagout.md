# Execute self TagIn and TagOut

Type: implementation
Status: resolved
Blocked by: None

## Question

How should parameterless self TagIn/TagOut compile and execute as typed standby mutations while same-tick root selection stays live?

## Acceptance

- Parameterless TagIn/TagOut compile to typed standby operations.
- Any optional parameter fails closed for this bounded route.
- P3 TagIn and active-root TagOut mutate only their caller.
- Later root controllers in the same tick observe refreshed Enemy/P2 selection.
- Input/combat/round/presentation/resource ownership remains unchanged.

## Answer

Parameterless TagIn/TagOut execute through a typed `team-standby` runtime hook. The hook validates the explicit IKEMEN profile, mutates only the caller through `RuntimeRootStandbyTransitionWorld`, and records subtype telemetry only after successful application. RunOrder resolves each later root's opponent from live team state, so P1 TagOut followed by P3 TagIn is visible to P4 in the same tick. Optional parameters and every gameplay consumer remain blocked.
