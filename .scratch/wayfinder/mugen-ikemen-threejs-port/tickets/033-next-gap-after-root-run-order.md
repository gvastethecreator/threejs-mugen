# Choose next gap after profile-gated root RunOrder

Type: research
Status: open
Blocked by: None

## Question

What is the next smallest source-backed IKEMEN scheduler package after bounded root MoveType/id ordering: `RunFirst` / `RunLast`, the `RunOrder` trigger, helper participation, or simultaneous Pause/SuperPause overwrite evidence?

## Candidate Inputs

- IKEMEN GO `AssertSpecial` run-order flags, `RunOrder` trigger, `updateRunOrder`, and appended-helper loop.
- Current `RuntimeCompatibilityProfile`, `RuntimeFighterRunOrderWorld`, helper micro-VM, and `MatchTickSchedule/v0` actor stamps.
- Existing AssertSpecial compiler/runtime support and helper lifecycle traces.
- Requirement to avoid exposing a trigger whose actor list or value cannot yet be represented honestly.

## Answer

Pending source/compiler/runtime-risk review.
