# DA29-125 architecture note

Wave 12 · revision 119e627410a4

## Decision surface

Decide Worker/OffscreenCanvas boundaries. Depends on DA29-124 and DA29-071.

## Acceptance

ADR compares worker transfer/copy cost, abort, progress, deterministic errors, browser support, rendering needs, and fallback; prototype covers the highest-cost phase.

## Constraints

Thread split adds copy and ownership bugs. Allows architecture/prototype only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
