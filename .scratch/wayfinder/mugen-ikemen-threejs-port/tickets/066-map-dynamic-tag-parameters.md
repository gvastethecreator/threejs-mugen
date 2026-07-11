# Map dynamic Tag parameters

Type: research
Status: open
Blocked by: None

## Question

How does pinned IKEMEN evaluate, coerce, order, and fail dynamic TagIn/TagOut optional parameter expressions?

## Acceptance

- Pin compiler and runtime source paths for every optional parameter.
- Separate integer, boolean, PlayerNo, mutable-order, and redirect semantics.
- Record evaluation versus mutation order and failure behavior.
- Define smallest dynamic execution slice without widening redirects or gameplay ownership.
