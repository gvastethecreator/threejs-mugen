# Research: helper-owned Projectile Z spawn

Date: 2026-07-16
Status: implementation completed (Wayfinder 214)

## Question

What Z position should the Three.js port assign when a Projectile is created by
a Helper state, and what is the smallest compatible change that preserves the
current owner/store contract?

## Primary sources

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed controller reference: Projectile parameters](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)

## Findings

IKEMEN's official `commitProjectile` path calls `helperPos` with a three-value
position (`offx`, `offy`, `offz`) and then writes the returned three-value
position to the Projectile. In `helperPos`, `P1` adds the third offset to the
current character/helper Z origin, `P2` adds it to the selected opponent Z
origin, and front/back/left/right use the authored third offset as their Z
position. This is the same coordinate family that the current port already
uses for root Projectile spawn and local-coordinate-aware depth data.

The port already parses `Projectile` `offset`/`pos` as
`MugenProjectileVector = [number, number, number?]`, but
`spawnRuntimeHelperProjectileActor` reduced that vector to `[x, y]` before
position resolution. `RuntimeHelper.pos` and the typed Helper controller also
only exposed XY, so a helper-origin Z could not survive into the real spawn
route.

## Decision

Add an optional third component to the typed Helper position and runtime helper
origin. The helper spawn world uses the existing fighter/P2 combat-depth origin
plus the authored third Helper position component. The helper Projectile spawn
world then uses the helper/P2 origin rules and preserves the third
`offset`/`pos` component. Zero/omitted depth remains omitted in the runtime
object where no explicit depth is observable, preserving legacy snapshots.

This does not change Projectile ownership: a helper-created Projectile remains
root-store-owned with `parentId` set to the helper serial. It also does not
claim helper Z kinematics, binding, collision, or rendering parity.

## Uncertainty and ceiling

The upstream source distinguishes helper position, Projectile position, and
local-coordinate scaling; the current port has no complete helper Z kinematic
or binding model. This slice therefore proves only spawn-time Z origin and
offset. Cross-localcoord conversion, dynamic helper position expressions,
helper Z velocity, depth collision, depth-bound removal, and perspective
presentation remain separate claims.

## Implementation evidence

- `HelperControllerOp.pos` and `RuntimeHelper.pos` now preserve an optional
  third component.
- The effect-spawn world carries the helper's initial depth from the fighter or
  P2 combat-depth origin plus the authored helper position offset.
- The production helper micro-VM spawn path carries Projectile `offset`/`pos`
  depth for both helper/P1 and helper/P2 origin cases.
- Focused tests: `124/124` passed; full suite: `216/216` files and
  `2284/2284` tests passed.
- TypeScript 7, production build, module boundaries, and trace QA passed;
  trace coverage is `633/633` with `0` skipped.
- Code commits: `bf12d7eb` and `5297bb65`.
