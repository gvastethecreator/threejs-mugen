# Execute static Tag member order

Type: implementation
Status: resolved
Blocked by: None

## Question

How should static one-based TagIn/TagOut `memberno` atomically swap caller member order only in explicit Tag mode?

## Acceptance

- Static positive integer `memberno` compiles for TagIn and TagOut.
- Runtime requires explicit Tag mode and caller membership.
- Invalid position leaves order and all existing Tag mutations unchanged.
- Successful swap is visible to later same-tick diagnostics without changing stable selection slots.
- Dynamic values, leader, redirects, and gameplay remain blocked.

## Answer

Static positive integer `memberno` compiles as `memberPosition` for TagIn/TagOut. Runtime requires explicit `teamMode: "tag"`, validates caller membership and one-based position before any state/control/standby/partner mutation, then swaps mutable order after caller state and before control/standby. Snapshot diagnostics expose the swap in the same tick while stable root slots and leader id remain unchanged. Invalid mode/position blocks all mutations and successful telemetry.
