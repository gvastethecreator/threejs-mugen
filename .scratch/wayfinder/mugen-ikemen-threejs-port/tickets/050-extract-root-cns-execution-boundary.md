# Extract root CNS execution boundary

Type: implementation
Status: open
Blocked by: None

## Question

How can `advanceFighter` expose a named CNS phase that preserves P1/P2 behavior exactly while allowing a later explicit-profile standby-root caller to execute CNS without inheriting input, combat, round, presentation, or effect-store ownership?

## Acceptance

- Existing P1/P2 phase order and 538 trace checksums stay stable.
- Controller execution has an explicit capability/participation input.
- Standby-root scheduling remains off until the extracted boundary is independently proven.
