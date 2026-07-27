# DA29-048 architecture note

Wave 4 · revision 119e627410a4

## Decision surface

Define atomic throw and custom-state ownership. Depends on DA29-041 and DA29-027.

## Acceptance

ADR covers target acquisition, state owner, position/bind, damage, release, interruption, KO, missing target, and rollback boundary with source refs.

## Constraints

Partial mutation can strand actors. Allows architecture only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
