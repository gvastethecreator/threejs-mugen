# DA29-091 architecture note

Wave 9 · revision 119e627410a4

## Decision surface

Choose the authoritative Studio storage model. Depends on DA29-008, DA29-009, and the IDB audit.

## Acceptance

ADR compares IndexedDB authority, file authority, and port-backed hybrid; it names consistency, offline, recovery, quota, migration, and permission tradeoffs.

## Constraints

Dual authority can diverge. Allows storage decision only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
