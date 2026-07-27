# DA29-079 architecture note

Wave 7 · revision 119e627410a4

## Decision surface

Define audio decode, cache, voice, and lifecycle policy. Depends on DA29-071 and DA29-083.

## Acceptance

ADR covers AudioContext creation/resume/close, buffers, voice stealing, pan/volume, pause, reset, errors, cache caps, and deterministic telemetry.

## Constraints

Browser gesture and leaks. Allows architecture only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
