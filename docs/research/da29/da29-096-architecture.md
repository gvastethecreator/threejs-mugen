# DA29-096 architecture note

Wave 9 · revision 119e627410a4

## Decision surface

Design multi-file project transactions. Depends on DA29-095.

## Acceptance

ADR defines write set, preimages, staging, commit marker, compensation order, partial external failures, concurrency, and user choice; prototype evidence measures cost.

## Constraints

File APIs lack cross-file atomicity. Allows architecture/prototype only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
