# Create Tag team order model

Type: implementation
Status: open
Blocked by: None

## Question

How should explicit IKEMEN Tag matches own stable root slots, mutable member order, and leader identity without changing current gameplay consumers?

## Acceptance

- Introduce versioned `RuntimeTagTeamOrder/v0` with side-local stable root ids, mutable order, and leader id.
- Make Tag mode explicit; non-Tag profiles expose no mutable Tag order.
- Validate unique same-side player roots and deterministic reset order.
- Support atomic member-position swap and leader rotation as pure/model operations.
- Publish diagnostics without changing scheduler, selection, gameplay, or rendering.
