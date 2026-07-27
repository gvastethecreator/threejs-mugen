# DA29-006 architecture note

Wave 0 · revision 119e627410a4

## Decision surface

Replace split selector/cursor constants with one materialization input. Depends on DA29-001. Systems: materializers and evidence JSON.

## Acceptance

One checked schema generates both artifacts; changing a pin in a fixture changes both; stale DA27 constants are removed.

## Constraints

Generator forks can recur. Allows synchronized control artifacts only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
