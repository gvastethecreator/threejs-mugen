# Map Helper standby participation boundaries

Type: research
Status: resolved
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

## Answer

Pinned IKEMEN treats standby as direct-character participation, not deactivation. Standby Helpers keep CNS, animation, drawing, identity, targets, and projectiles active. Effective `Ctrl` reads false; direct character hit/hurt, push, camera, Enemy, and P2 participation are filtered. Projectile/player detection rejects a standby getter but does not reject a live standby projectile owner, and projectile clashes have no owner-standby filter.

The sandbox already preserves CNS, identity, projectiles, target controllers, and presentation. Helpers are absent from incoming hurt, push, camera, and executable opponent-candidate paths. Two gaps block true/default Helper self: `RuntimeHelperCombatWorld` still admits direct HitDef from standby Helpers, and helper expressions expose stored rather than effective control. Wayfinder 083 will close those two gaps and toggle Helper standby without widening aggregate partner/order or unmodeled gameplay consumers.
