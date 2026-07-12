# Execute Helper standby participation

Type: implementation
Status: resolved
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

## Answer

Root-executed TagIn/TagOut can now toggle a live redirected Helper's standby flag after all local state/control validation and mutation. `runtimeHelperCanDirectlyInteract` rejects destroyed, disabled, and standby Helpers from direct HitDef; helper expression contexts project effective `Ctrl = 0` while preserving the stored flag. CNS, state time, identity, target state, snapshots, animation, drawing, and Helper-parented projectiles remain active.

The IKEMEN single-Helper RunOrder path also now receives the same effect-spawn/count/modify context as bulk Helper advancement. This closes a pre-existing scheduler gap exposed by the standby projectile regression.

## Evidence

- Static default self and dynamic true self cover TagOut/TagIn plus state/control order.
- Standby direct HitDef is suppressed and resumes after TagIn.
- Standby CNS increments state/variables, `Ctrl` expressions read false, and the raw control flag remains true.
- A Helper-parented projectile spawns and advances while its parent remains standby and visible in snapshots.
- Aggregate axes, self-false no-op, invalid state, stale/disabled identity, and legacy profile still fail closed.
- Focused and adjacent verification: 252 tests passed.
- Full verification: 170 files / 1714 tests, TypeScript 7 typecheck/build, 538/538 traces, boundaries, and diff check passed.
