# Choose next gap after IKEMEN root RunOrder trigger

Type: research
Status: resolved
Blocked by: None

## Question

What is the next scheduling package after two-root `RunOrder`: integrate helper actors into the ordered action list, or resolve simultaneous root Pause/SuperPause ownership and overwrite semantics?

## Candidate Inputs

- Current helper micro-VM and effect lifecycle actor records versus root `FighterMatchState` execution contracts.
- IKEMEN GO appended-helper action loop and helper priority classes.
- Existing root schedule-phase gates and helper lifecycle trace evidence.
- Existing same-tick Pause symmetry and unresolved simultaneous controller ownership.

## Answer

Selected helper actor-list integration. The existing helper micro-VM already had actor-local state and controller execution, while IKEMEN GO's pinned `CharList` source provides exact helper priority classes and same-loop appended-helper behavior. The implementation now shares root/helper RunOrder under explicit `ikemen-go`, advances appended helpers later in the creation tick, and removes the duplicate bulk helper tick. Required artifact `synthetic-imported-ikemen-helper-runorder.json` passes at checksum `174f927d` / final `3906023d` inside 532/532 gates. Simultaneous Pause/SuperPause ownership remains the next independent scheduling package.
