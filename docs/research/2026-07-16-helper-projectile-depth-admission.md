# Research: helper-parented Projectile depth admission

Date: 2026-07-16
Status: implementation completed (Wayfinder 215)

## Question

Does the existing projectile Z admission remain valid for a helper-created
Projectile, and what evidence is needed without inventing another ownership
model?

## Primary source

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)

The same source contains the helper position/Projectile commit path and the
three-dimensional `hitResultCheck` comparison used when a Projectile contacts
a character.

## Findings

IKEMEN's `commitProjectile` writes the result of `helperPos` into the
Projectile's three-dimensional position. Its `hitResultCheck` path then uses
`proj.pos[2]` in the Projectile-versus-character position difference before
contact resolution. Helper creation therefore changes the parent identity and
execution context, but not the Projectile's Z contact primitive.

The port already keeps helper-created Projectiles in the owner's root effect
store with `parentId` set to the helper serial. `RuntimeProjectileCombatWorld`
applies the shared depth oracle before XY hurtbox admission and HitFlag P. The
missing proof is an explicit helper-parented fixture at separated and touching
Z ranges.

## Decision

Add focused combat coverage using the existing runtime Projectile shape with a
helper `parentId`. Keep the current root-store owner, team filters, collision
boxes, and depth oracle unchanged. A separated range must remain live and a
touching range must resolve the same contact/removal behavior as a root
Projectile.

## Uncertainty and ceiling

This proves only helper-parented Projectiles attacking root actors through the
current combat world. It does not establish helper actors as defenders,
helper/team/proxy destination ownership, exact upstream ordering, depth-bound
timing, rollback/netplay, or complete parity.

## Implementation evidence

- Added helper-parented separated/touching depth cases to
  `ProjectileCombatSystem.test.ts` without changing the existing combat
  implementation.
- Focused tests: `31/31` passed; full suite after the test commit:
  `216/216` files and `2285/2285` tests passed.
- TypeScript 7 passed. The preceding runtime checkpoint also passed build,
  module boundaries, and trace QA at `633/633` with `0` skipped; no trace
  preset or production runtime source changed in this test-only slice.
- Commit: `f612ea4e`.
