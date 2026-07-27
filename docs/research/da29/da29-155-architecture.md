# DA29-155 architecture note

Wave 15 · revision 119e627410a4

## Decision surface

Define AI input and decision ownership. Depends on DA29-021, DA29-028, and DA29-151.

## Acceptance

ADR separates authored CNS AI logic, engine-controlled inputs, difficulty, deterministic RNG, observation, reaction delay, pause, replay, and user override.

## Constraints

Hidden AI cheats or replay drift. Allows architecture only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
