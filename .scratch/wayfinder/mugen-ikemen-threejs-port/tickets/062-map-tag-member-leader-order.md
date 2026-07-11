# Map Tag member and leader order

Type: research
Status: resolved
Blocked by: None

## Question

How do TagIn/TagOut `memberno` and TagIn `leader` mutate team order and leader identity relative to state, standby, and partner selection?

## Acceptance

- Pin one-based inputs, validation, and mutation order from official source.
- Separate stable player slot, mutable member order, and leader identity.
- Determine effects on subsequent partner selection in the same tick.
- Bound the next implementation without altering gameplay ownership.

## Answer

`memberno` is one-based mutable team-order position: IKEMEN subtracts one and swaps the caller's current member position with the requested position, only in Tag mode. TagIn `leader` is one-based stable PlayerNo: IKEMEN subtracts one, validates same-side root identity, rotates that root to the front, moves dead members toward the tail, updates `teamLeader`, then rewrites every `memberNo`. Stable P1-P8 slots never change. Current runtime has no team mode, mutable member order, or leader owner, so direct controller execution would conflate identity with order. Next cut must introduce an explicit `RuntimeTagTeamOrder/v0` model before compiling either parameter.
