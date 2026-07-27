# DA29-014 architecture note

Wave 1 · revision 119e627410a4

## Decision surface

Make one controller-support registry feed compiler, docs, and materializers. Depends on DA29-013. Systems: compiler table, support registry, coverage JSON.

## Acceptance

One versioned registry records parse, compile, execute, trace, and product states; generated docs match it byte-for-byte.

## Constraints

A registry can overstate runtime depth. Allows registry consistency only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
