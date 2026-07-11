# Map IKEMEN Helper Tag redirect semantics

Type: research
Status: resolved
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

## Answer

Pinned IKEMEN source applies `RedirectID` to a Helper without changing expression ownership: the original caller evaluates every parameter, while `state`, `ctrl`, and the `SCF_standby` bit mutate the Helper. A partner ordinal selects a root teammate from the Helper's inherited PlayerNo slot; partner state/control and standby then mutate that root. `memberno` and `leader` also reach the root team-order model. The source does not classify these axes as root-only.

Lookup rejects negative, missing, destroyed, and disabled targets, but accepts standby Helpers and does not traverse parent/root lifecycle. Standby Helpers continue running CNS while collision, hit/push, camera, and Enemy/P2 participation are suppressed elsewhere. The local runtime can already store Helper state, control, and standby and keeps scheduling standby Helpers, but it does not yet enforce all standby gameplay/presentation exclusions. Wayfinder 081 therefore admits only explicit `self = 0` Helper-local state/control redirects; standby, partner, member, leader, Helper-originated Tag, and exact incremental mutation remain separate gates.
