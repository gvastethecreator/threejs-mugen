# Choose next gap after IKEMEN root run flags

Type: research
Status: resolved
Blocked by: None

## Question

What is the next source-backed scheduling package after two-root `RunFirst` / `RunLast`: expose the `RunOrder` trigger for roots, integrate helper actors into the scheduler, or resolve simultaneous Pause/SuperPause ownership?

## Candidate Inputs

- IKEMEN GO `RunOrder` trigger implementation and complete `CharList.runOrder` indexing semantics.
- Current helper micro-VM/effect lifecycle versus root `FighterMatchState` execution contracts.
- Required `MatchTickSchedule/v0` phase-sequence gate added by ticket 033.
- Existing same-tick root Pause symmetry and unresolved simultaneous overwrite behavior.

## Answer

Select the `RunOrder` trigger for the two current roots behind explicit `ikemen-go`. Pinned IKEMEN source returns the actor's one-based index in the already sorted run list and `-1` when absent. The current scheduler can represent this exactly for its bounded two-root list after previous-tick `RunFirst`/`RunLast`, MoveType, and id sorting.

Implementation stamps root indices before frame-start triggers. Required `synthetic-imported-ikemen-runorder.json` checksum `04d433de` / final `390fb921` proves P2 branches through `RunOrder = 1` into state `282` while the same frame records `p2 -> p1` controller order. Helpers/appended actors and simultaneous Pause ownership remain deferred.
