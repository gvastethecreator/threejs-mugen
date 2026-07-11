# Execute static Tag member order

Type: implementation
Status: open
Blocked by: None

## Question

How should static one-based TagIn/TagOut `memberno` atomically swap caller member order only in explicit Tag mode?

## Acceptance

- Static positive integer `memberno` compiles for TagIn and TagOut.
- Runtime requires explicit Tag mode and caller membership.
- Invalid position leaves order and all existing Tag mutations unchanged.
- Successful swap is visible to later same-tick diagnostics without changing stable selection slots.
- Dynamic values, leader, redirects, and gameplay remain blocked.
