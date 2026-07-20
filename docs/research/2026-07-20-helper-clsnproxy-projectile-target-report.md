# T357 research report: Helper clsnproxy projectile target collision

Date: 2026-07-20

## Question

Does the target-side `clsnproxy` extension reach projectile contact and
projectile cancellation?

## Primary source

The pinned local checkout and the official revision of
[`src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10089-L10172)
show that `projClsnCheck` flattens the target root and active proxy children,
then reads the selected target collision group. Size-box checks stay root-only.

## Implementation

`RuntimeCombatResolutionWorld.resolveProjectile` now resolves the defender's
`clsn2` list through `getCollisionBoxes` before using the legacy hurt-box
fallback. `ProjectileCombatSystem` already consumes the supplied `hurtBoxes`
for the defender's projectile-cancel rule and the typed target accessor for
projectile `p2clsncheck`, so the selected root proxy extension reaches both
paths without widening projectile ownership.

## Evidence

- `RuntimeCombatResolutionSystem.test.ts` proves a projectile hits when its
  base hurt-box input misses and the resolved root `clsn2` box overlaps.
- `ProjectileCombatSystem.test.ts` and `PlayableMatchRuntime.test.ts` retain
  the existing projectile and live-runtime coverage.
- Focused Vitest: `357/357` across `3` files.
- TypeScript 7 typecheck, production build (`327` modules), boundary check,
  and `634/634` trace artifacts passed.
- `diagnostics.json` reports `600` required and `34` optional artifacts,
  `634` passed, `0` failed, and `0` skipped fixtures.
- The latest full baseline remains T356's `240/240` files and `2612/2612`
  tests; full Vitest and browser smoke are deferred for this runtime-only
  block.

## Limits and next work

Projectile `p2clsncheck` variants beyond the bounded `clsn2` path, projectile
clashes, helper-owned projectiles, full scale and angle behavior, and paired
upstream/local traces remain open.
