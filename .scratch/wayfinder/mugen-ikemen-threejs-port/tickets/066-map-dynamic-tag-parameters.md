# Map dynamic Tag parameters

Type: research
Status: resolved
Blocked by: None

## Question

How does pinned IKEMEN evaluate, coerce, order, and fail dynamic TagIn/TagOut optional parameter expressions?

## Acceptance

- Pin compiler and runtime source paths for every optional parameter.
- Separate integer, boolean, PlayerNo, mutable-order, and redirect semantics.
- Record evaluation versus mutation order and failure behavior.
- Define smallest dynamic execution slice without widening redirects or gameplay ownership.

## Answer

Pinned IKEMEN stores every optional value as bytecode and evaluates it at controller execution with `evalI` or `evalB`. Serialized parameter order controls evaluation and immediate effects; negative state/partner values stop later parameters, while member/leader mutations accept integer coercion then rely on their bounded mutators. Redirect resolves first. IKEMEN can retain earlier mutations after a later failure; sandbox keeps its established aggregate atomic validation as an explicit bounded divergence. Dynamic `self` is the smallest next slice because it needs only boolean expression resolution and no new target/order identity.
