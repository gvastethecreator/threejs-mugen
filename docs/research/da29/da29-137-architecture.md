# DA29-137 architecture note

Wave 13 · revision 119e627410a4

## Decision surface

Define a renderer/resource port. Depends on DA29-071…075 and DA29-123.

## Acceptance

Port separates scene facts, camera, resources, lifecycle, metrics, and capture from MUGEN sprites/stages; Three.js adapter passes ownership tests.

## Constraints

Abstraction can hurt performance. Allows renderer port only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
