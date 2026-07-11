# Create Tag team order model

Type: implementation
Status: resolved
Blocked by: None

## Question

How should explicit IKEMEN Tag matches own stable root slots, mutable member order, and leader identity without changing current gameplay consumers?

## Acceptance

- Introduce versioned `RuntimeTagTeamOrder/v0` with side-local stable root ids, mutable order, and leader id.
- Make Tag mode explicit; non-Tag profiles expose no mutable Tag order.
- Validate unique same-side player roots and deterministic reset order.
- Support atomic member-position swap and leader rotation as pure/model operations.
- Publish diagnostics without changing scheduler, selection, gameplay, or rendering.

## Answer

`RuntimeTagTeamOrder/v0` now owns stable side-local root ids, mutable member order, and leader id only when `teamMode: "tag"` is explicit under IKEMEN. Construction validates unique player roots and both sides, sorting stable P1-P8 slots deterministically. Atomic member swap and leader rotation preserve stable ids; rotation supports dead-member sinking. Reset restores slot order/leader. `MugenSnapshot.tagTeamOrder` publishes deep-copy diagnostics while scheduler, root selection, standby, gameplay, and rendering remain unchanged.
