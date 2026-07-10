# Choose next gap after IKEMEN root run flags

Type: research
Status: open
Blocked by: None

## Question

What is the next source-backed scheduling package after two-root `RunFirst` / `RunLast`: expose the `RunOrder` trigger for roots, integrate helper actors into the scheduler, or resolve simultaneous Pause/SuperPause ownership?

## Candidate Inputs

- IKEMEN GO `RunOrder` trigger implementation and complete `CharList.runOrder` indexing semantics.
- Current helper micro-VM/effect lifecycle versus root `FighterMatchState` execution contracts.
- Required `MatchTickSchedule/v0` phase-sequence gate added by ticket 033.
- Existing same-tick root Pause symmetry and unresolved simultaneous overwrite behavior.

## Answer

Pending source/runtime-shape and trace-oracle review.
