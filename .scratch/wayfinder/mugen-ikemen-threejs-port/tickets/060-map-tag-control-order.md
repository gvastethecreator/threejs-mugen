# Map Tag control order

Type: research
Status: resolved
Blocked by: None

## Question

How should TagIn static `ctrl` and `partnerctrl` combine with state entry and standby mutation without granting broader gameplay ownership?

## Acceptance

- Pin caller/partner control defaults and order from official source.
- Define whether state entry metadata may overwrite explicit control.
- Bound atomic validation and failure behavior.
- Keep TagOut, redirects, member/leader order, and dynamic values explicit.

## Answer

TagIn evaluates caller `stateno` before `ctrl`, then applies caller standby. A selected partner applies standby, enters `partnerstateno`, then receives `partnerctrl`. Explicit control therefore overrides StateDef control metadata for both roots. Caller `ctrl` implies self when self is omitted; partner control requires a resolved partner and does not imply caller mutation when partner is present. The bounded subset accepts exact static `0|1`, requires static partner for partner control, validates every state/target first, and keeps TagOut/control, dynamic values, redirects, member/leader order, and gameplay blocked.
