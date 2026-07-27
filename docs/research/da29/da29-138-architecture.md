# DA29-138 architecture note

Wave 13 · revision 119e627410a4

## Decision surface

Define input/clock/replay ports. Depends on DA29-021…030 and DA29-133.

## Acceptance

Ports expose deterministic frames, seat actions, clock domains, RNG, snapshot, and replay without CNS or team terms; fighting adapters preserve current traces.

## Constraints

Generic clock may omit fighting pause rules. Allows ports only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
