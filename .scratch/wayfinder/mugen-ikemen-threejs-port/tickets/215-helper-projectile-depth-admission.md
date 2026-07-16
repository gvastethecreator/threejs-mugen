# Close helper-parented Projectile depth admission v1

Type: task
Status: resolved
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

## Implementation result

- Added explicit helper-parented Projectile coverage against the existing root
  effect store and `RuntimeProjectileCombatWorld`.
- Separated Z ranges remain live and touching Z edges resolve the same contact
  and removal path as root-created Projectiles.
- No ownership, team, collision-box, or depth-oracle implementation changes
  were required.

## Evidence

- Focused `ProjectileCombatSystem` tests: `31/31` passed.
- `pnpm typecheck`: passed.
- Full suite after the test commit: `216/216` files and `2285/2285` tests
  passed with `--testTimeout=30000`.
- The accumulated Wayfinder 214 runtime checkpoint remains green for build,
  boundaries, and trace QA: build passed, `pnpm check:boundaries` passed, and
  `pnpm qa:trace` passed `633/633` artifacts with `0` skipped.
- Code/test commit: `f612ea4e`.

Claim ceiling: helper-parented Projectiles attacking root actors now have
explicit separated/touching Z admission evidence under the existing owner
store. Helper actors as defenders, proxy/team breadth, depth-bound timing,
presentation, rollback/netplay, and complete MUGEN/IKEMEN parity remain open.
