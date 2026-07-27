# DA29-020 architecture note

Wave 1 · revision 119e627410a4

## Decision surface

Version the execution environment envelope. Depends on DA29-008 and DA29-009. Systems: tests, traces, browser and scanner outputs.

## Acceptance

Schema records seed, clock mode, locale, timezone, browser, GPU, Node, package lock, source pins, flags, and fixture digests; incompatible envelopes cannot merge.

## Constraints

Hidden environment drift. Allows comparable-run identity only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
