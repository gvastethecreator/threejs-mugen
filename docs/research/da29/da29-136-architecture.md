# DA29-136 architecture note

Wave 13 · revision 119e627410a4

## Decision surface

Define a storage port from proven Studio behavior. Depends on DA29-091…100 and DA29-133.

## Acceptance

Port covers transaction, revision, watch/conflict, permission, recovery, export, and errors; IDB/file adapters pass the same contract suite where applicable.

## Constraints

Lowest-common-denominator API. Allows port design and conformance only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
