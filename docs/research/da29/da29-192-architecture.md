# DA29-192 architecture note

Wave 19 · revision 119e627410a4

## Decision surface

Define versioned public APIs for proven engine ports. Depends on DA29-140 and DA29-191.

## Acceptance

API review covers types, lifecycle, errors, async/cancel, events, deterministic contracts, browser support, compatibility policy, examples, and excluded domain owners.

## Constraints

Public API freezes weak seams. Allows candidate API only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
