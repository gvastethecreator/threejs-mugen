# Map IKEMEN Helper Tag redirect semantics

Type: research
Status: claimed
Blocked by: None

## Question

Which TagIn/TagOut parameters and lifecycle flags mutate a Helper selected through RedirectID, and which root/team/order operations must be rejected or translated?

## Acceptance

- Pin the answer to the official IKEMEN wiki and the repository SHA already used by the compatibility research.
- Trace TagIn and TagOut parameter order for a Helper target, including self, state, control, partner, member, leader, and standby behavior.
- Distinguish Helper-local state/control mutation from root-only team order, partner selection, and gameplay participation.
- Map invalid, destroyed, disabled, and parent/root lifecycle behavior without assuming root semantics.
- Audit the current Helper scheduler, state owner, team state, and effect-store boundaries against that contract.
- Produce a narrow implementation sequence and keep execution unchanged in this ticket.
