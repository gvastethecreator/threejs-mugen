# Choose next gap after profile-gated root RunOrder

Type: research
Status: resolved
Blocked by: None

## Question

What is the next smallest source-backed IKEMEN scheduler package after bounded root MoveType/id ordering: `RunFirst` / `RunLast`, the `RunOrder` trigger, helper participation, or simultaneous Pause/SuperPause overwrite evidence?

## Candidate Inputs

- IKEMEN GO `AssertSpecial` run-order flags, `RunOrder` trigger, `updateRunOrder`, and appended-helper loop.
- Current `RuntimeCompatibilityProfile`, `RuntimeFighterRunOrderWorld`, helper micro-VM, and `MatchTickSchedule/v0` actor stamps.
- Existing AssertSpecial compiler/runtime support and helper lifecycle traces.
- Requirement to avoid exposing a trigger whose actor list or value cannot yet be represented honestly.

## Answer

Select `AssertSpecial` `RunFirst` / `RunLast` for the two current roots behind explicit `ikemen-go`. IKEMEN assigns exclusive `RunFirst` priority `100`, exclusive `RunLast` priority `-100`, neutralizes the pair when both are asserted, consumes both flags during `updateRunOrder`, and sorts before current command/action work. The sandbox already compiles and executes bounded imported `AssertSpecial`, so this package extends the existing root scheduler without pretending that helpers or `RunOrder` values exist.

Implementation snapshots RunOrder before frame-start flag reset, therefore consuming flags established on the previous tick. Required trace `synthetic-imported-ikemen-runfirst.json` checksum `56e17803` proves a one-tick `RunFirst` assertion schedules P2 before an attacking P1 on the next tick. `RunOrder`, helpers/appended actors, teams, and simultaneous Pause ownership remain deferred.
