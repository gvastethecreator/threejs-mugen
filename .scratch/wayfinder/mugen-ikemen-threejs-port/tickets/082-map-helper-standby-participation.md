# Map Helper standby participation boundaries

Type: research
Status: claimed
Blocked by: None

## Question

Which runtime, combat, selection, collision, camera, and presentation paths must consume a Helper's standby flag before TagIn/TagOut may safely toggle it?

## Acceptance

- Pin the exact IKEMEN checks that let standby Helpers continue CNS while suppressing hit, hurt, push, camera, Enemy, and P2 participation.
- Determine whether drawing/presentation continues, is state-driven, or is directly filtered; do not infer invisibility from standby.
- Audit direct Helper HitDef, Helper projectile ownership, target selection, collision/push, opponent rosters, camera inputs, effect snapshots, and renderer ordering in the local runtime.
- Separate behavior already absent by architecture from behavior that needs an explicit standby policy.
- Define one reusable participation predicate or boundary with no scattered flag checks unless source behavior requires them.
- Produce focused tests/trace evidence and a narrow implementation sequence; keep execution unchanged in this ticket.
