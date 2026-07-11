# Map Tag control order

Type: research
Status: open
Blocked by: None

## Question

How should TagIn static `ctrl` and `partnerctrl` combine with state entry and standby mutation without granting broader gameplay ownership?

## Acceptance

- Pin caller/partner control defaults and order from official source.
- Define whether state entry metadata may overwrite explicit control.
- Bound atomic validation and failure behavior.
- Keep TagOut, redirects, member/leader order, and dynamic values explicit.
