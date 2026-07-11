# Map Tag member and leader order

Type: research
Status: open
Blocked by: None

## Question

How do TagIn/TagOut `memberno` and TagIn `leader` mutate team order and leader identity relative to state, standby, and partner selection?

## Acceptance

- Pin one-based inputs, validation, and mutation order from official source.
- Separate stable player slot, mutable member order, and leader identity.
- Determine effects on subsequent partner selection in the same tick.
- Bound the next implementation without altering gameplay ownership.
