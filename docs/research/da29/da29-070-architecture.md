# DA29-070 architecture note

Wave 6 · revision 119e627410a4

## Decision surface

Define the netplay and rollback claim fence. Depends on DA29-030 and DA29-061.

## Acceptance

ADR lists deterministic blockers, transport/auth out of scope, snapshot cadence, desync facts, spectator/reconnect questions, and gates before any network work.

## Constraints

Premature netplay promise. Allows architecture boundary only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
