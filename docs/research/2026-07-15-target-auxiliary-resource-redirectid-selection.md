# Root Target auxiliary resource RedirectID selection

Date: 2026-07-15

## Question

What is the next independent root ownership boundary after helper-to-helper
auxiliary resource routing, and can the existing root target dispatch prove
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd` for both
active CNS and State -1 setup?

## Answer

Select the root active plus State -1 auxiliary target-resource pair. IKEMEN's
official controller reference defines all three controllers as mutations of
remembered targets, with optional target-ID filtering; `TargetRedLifeAdd` also
has explicit defense-scaling and `absolute` semantics. The local runtime
already has typed operations, resource-world mutation, root `RedirectID`
resolution, and State -1 setup classification. The missing evidence is a
paired root trace that proves destination target memory and target actor
resource writeback in both controller phases.

## Sources

- [IKEMEN-GO state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  defines `RedirectID`, `TargetDizzyPointsAdd`, `TargetGuardPointsAdd`, and
  `TargetRedLifeAdd`, including target `ID` filtering and `absolute` behavior.
- [Elecbyte state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines the MUGEN target-controller ownership baseline and target memory
  filtering pattern.
- `src/mugen/runtime/TargetSystem.ts` is the local typed target mutation seam
  for life, red life, guard points, and dizzy points.
- `src/mugen/runtime/StateProgramExecutor.ts` is the local State -1 setup
  classifier for target side effects.
- `src/mugen/runtime/PlayableMatchRuntime.ts` is the local root
  `RedirectID` resolver and destination target-memory route.

## Findings

1. Active and State -1 root routes share target-memory selection but differ in
   controller scheduling. They need separate required artifacts.
2. The destination root, not the caller, must supply the target list after
   `RedirectID` resolution. The target actor must receive the resource mutation
   through the existing `RuntimeResourceSystem`.
3. `TargetRedLifeAdd` must retain `absolute = 1` in the fixture to isolate
   ownership from defense-scaling variance. Existing red-life clamp behavior
   remains part of the local contract.
4. No new ownership model is needed for this slice. Helper, projectile, team,
   neutral, custom-state, and target Set/Score variants stay out of scope.

## Decision

Extend the existing root target trace factory with a paired auxiliary-resource
   route. Require controller and operation telemetry, both root target links,
   actor-frame resource observations, and final resource values. Keep the
   runtime implementation bounded to the existing root resolver.

## Acceptance

- Active root artifact passes for all three controllers through destination
  root `PlayerID`.
- State -1 artifact passes for all three controllers through destination root
  `PlayerID`.
- Existing target families and root/helper fail-closed boundaries remain
  unchanged.
- Focused suite, TypeScript 7, build, boundaries, syntax, diff checks, and
  full trace batch pass before closeout.

## Uncertainty

This does not establish helper/projectile/team/neutral ownership, target
multi-selection order, recursive redirects, persistence/rollback/netplay,
renderer/HUD projection, or complete MUGEN/IKEMEN parity.
