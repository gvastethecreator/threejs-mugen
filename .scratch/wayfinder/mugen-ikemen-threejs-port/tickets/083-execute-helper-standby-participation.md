# Execute Helper standby participation

Type: implementation
Status: claimed
Blocked by: None

## Question

How can root-executed TagIn/TagOut RedirectID toggle a live Helper's standby flag while preserving IKEMEN's scheduled, projectile, and presentation behavior?

## Acceptance

- Add one reusable direct-character participation predicate that rejects destroyed, disabled, or standby Helpers.
- Suppress direct Helper HitDef while standby and resume it after TagIn without stopping CNS or state time.
- Expose effective Helper `Ctrl = 0` in expressions while standby without clearing the stored control flag.
- Allow default/true Helper `self` to clear standby on TagIn or set it on TagOut after local state/control validation and mutation.
- Preserve Helper identity lookup, projectiles, projectile clashes/contact, target controllers, snapshots, animation, and drawing while standby.
- Keep partner/member/leader aggregate axes, Helper-originated Tag, incoming Helper hurt, push/camera/opponent widening, initial Helper `standby`, custom state ownership, and exact incremental mutation blocked.
- Prove static/dynamic self, state/control order, direct-combat suppression/resume, stored/effective control, CNS continuation, projectile continuation, snapshot visibility, blocked aggregate/lifecycle routes, and legacy rejection.
- Close with focused tests, full tests, TypeScript 7 typecheck/build, trace, boundaries, diff check, docs, and a feature commit.
