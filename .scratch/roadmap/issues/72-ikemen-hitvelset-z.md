# Issue 72 — Ikemen-GO `HitVelSet` Z flag

- **Status:** closed-bounded
- **Priority:** I2
- **Lane:** runtime / compiler
- **Dependency:** Issue 66 / T481

## Scope

Implement Ikemen-GO's nightly `HitVelSet` `z` parameter. A nonzero `z` flag
copies the active hit's optional depth velocity into `combatDepth.velocity`,
while the existing X/Y flags keep their M.U.G.E.N behavior. Missing hit
velocity remains a no-op, preserving the current controller guard.

## Authority

- [Ikemen-GO changed state-controller reference — HitVelSet Z](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitvelset-parameters)
- [Ikemen-GO changed triggers / depth velocity context](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29)

## Evidence

- `src/mugen/compiler/ControllerOps.ts` retains static `HitVelSet z` in typed
  kinematic IR.
- `src/mugen/runtime/KinematicControllerSystem.ts` applies the Z flag from
  active `hitVelocity.z` into the existing combat-depth velocity channel.
- `src/tests/KinematicControllerSystem.test.ts` and
  `src/tests/RuntimeCompiler.test.ts` cover static compilation, Z application,
  and no-hit no-op behavior (71 focused tests in the two-file slice).

## Claim ceiling

This issue does not claim generic Z physics, M.U.G.E.N `HitVelSet` Z support,
dynamic parameter parity, or helper/team/custom-state breadth.
