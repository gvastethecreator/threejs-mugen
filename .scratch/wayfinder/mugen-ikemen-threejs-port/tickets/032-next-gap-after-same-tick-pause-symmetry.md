# Choose next gap after same-tick Pause symmetry

Type: research
Status: open
Blocked by: None

## Question

What is the next smallest source-backed actor-scheduling package after root-player same-tick Pause symmetry: explicit prepare/run phase ownership, dynamic RunOrder parity, helper participation, or simultaneous Pause/SuperPause overwrite semantics?

## Candidate Inputs

- IKEMEN GO `CharList.updateRunOrder`, all-character `actionPrepare`, sequential `actionRun`, and appended-helper processing.
- Current two-root-player `MatchTickSchedule/v0` phase stamps and checksum exclusion.
- Existing Pause/SuperPause, helper, guard, and controller-order required traces.
- Runtime scope rule favoring one proof-producing compatibility cut over broad scheduler rewrite.

## Answer

Pending source/order-risk review.
