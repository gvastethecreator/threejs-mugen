# Close helper-parented Projectile depth admission v1

Type: task
Status: in progress
Blocked by: None

## Question

Does a Projectile created by a Helper use the same inclusive Z admission as a
root-created Projectile when it remains in the owner's root effect store?

## Answer

Prove the existing combat contract at the helper-parented boundary. A helper
Projectile keeps its root owner store and helper `parentId`; the depth oracle
must reject separated Z ranges and admit touching ranges before XY contact,
without changing combat ownership or collision policy.

## Authority

- IKEMEN's helper-created Projectile commit path writes a three-dimensional
  position and keeps the Projectile in the owner's projectile collection.
- IKEMEN's `hitResultCheck` compares the Projectile's three-dimensional
  position against the defender before resolving contact.
- The port's `RuntimeProjectileCombatWorld` already applies the shared depth
  oracle before player contact and HitFlag P; this slice adds the missing
  helper-parented evidence.

## Boundaries

Included: helper-parented root-store Projectile depth rejection, touching-edge
admission, and focused combat coverage.

Deferred: helper-as-defender combat, proxy/team ownership breadth, dynamic
depth mutation, depth-bound timing, presentation, rollback/netplay, and
complete MUGEN/IKEMEN parity.

## Verification target

- Projectile combat test covers separated and touching helper-parented ranges.
- TypeScript 7 and the next accumulated runtime checkpoint close the slice.

## Sources

- `docs/research/2026-07-16-helper-projectile-depth-admission.md`

