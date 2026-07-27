# DA29-021 architecture note

Wave 2 · revision 119e627410a4

## Decision surface

Define input authority across keyboard, gamepad, UI, demo, and replay. Depends on DA29-020. Systems: MatchInputPolicy and App.

## Acceptance

ADR defines seat ownership, focus, merge order, edge/hold semantics, disconnect, and deterministic sampling; conflict table has tests planned.

## Constraints

Double input or focus leaks. Allows architecture only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
