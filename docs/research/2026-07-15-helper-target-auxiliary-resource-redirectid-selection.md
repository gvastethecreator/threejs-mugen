# Helper-to-helper auxiliary Target resource RedirectID selection

Date: 2026-07-15

## Question

Can a live helper execute `TargetRedLifeAdd`, `TargetGuardPointsAdd`, and
`TargetDizzyPointsAdd` through `RedirectID` when the destination `PlayerID`
belongs to another live helper?

## Answer

Yes, within a bounded `ikemen-go` route. Resolve the destination helper from
the live identity registry, use that helper's target memory for the authored
target ID, apply the existing auxiliary-resource mutation rules to the
selected target actor, and commit the destination helper wrapper after the
dispatch. Invalid, missing, destroyed, and disabled destinations fail closed.

## Official sources

- [IKEMEN-GO state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  documents `RedirectID` as dispatch to the player/helper with the designated
  `PlayerID` and documents the three target resource controllers.
- The same reference defines `TargetDizzyPointsAdd` and
  `TargetGuardPointsAdd` as additions to each selected target's resource,
  with optional target `ID` selection defaulting to all targets.
- The same reference defines `TargetRedLifeAdd` as a red-life addition with
  optional target `ID` selection and defense scaling unless `absolute = 1`.

## Findings

1. The redirected helper owns the target list used by the controller. The
   caller helper's remembered target list must not be consulted after
   `RedirectID` resolves a helper destination.
2. The target actor owns red life, guard points, and dizzy points. The helper
   destination is an ownership anchor for target selection, not a replacement
   for the target actor's resource state.
3. `TargetRedLifeAdd` reuses the runtime resource world, including authored
   absolute/scaled behavior and the existing red-life clamp against current
   life. The fixture uses `absolute = 1` so the route is deterministic.
4. Temporary helper target actors require wrapper writeback after dispatch.
   This preserves helper target memory and any resource mutation performed on
   a selected helper target across the next helper tick.
5. `TargetState` and `BindToTarget` helper destinations remain separate
   ownership contracts. This feature does not widen either custom-state entry
   or binding semantics.

## Decision

Allow helper `TargetRedLifeAdd`, `TargetGuardPointsAdd`, and
`TargetDizzyPointsAdd` `RedirectID` to resolve another live helper. Reuse the
typed target operations and resource world, keep the destination helper's
target memory authoritative, and preserve fail-closed behavior for unsupported
helper custom-state routes.

## Boundary

- Profile: `ikemen-go`.
- Caller: live helper state controller.
- Destination: live, non-destroyed, non-disabled helper resolved by `PlayerID`.
- Target selection: destination helper target memory and authored target ID.
- Mutation: target actor red life, guard points, and dizzy points.
- Failure: invalid, missing, destroyed, disabled, and unsupported helper
  custom-state routes fail closed.

Helper State -1/global-state execution, helper/projectile/team/neutral
ownership, `TargetScoreAdd`, target Set variants, recursive redirects, exact
multi-target order, persistence, rollback/netplay, cross-localcoord behavior,
presentation parity, and full MUGEN/IKEMEN parity remain open.

## Local evidence

- Runtime commit: `f48093b6`.
- Fixture and QA commit: `70823693`.
- Required trace: `synthetic-imported-helper-target-auxiliary-redirect`,
  checksum `d56173b3`.
- Full trace batch: `631/631` passed, `597` required, `34` optional, `0`
  skipped.
- Affected suite: `716/716` passed.

## Next decision

Select a separate helper custom-state destination contract or the next
source-backed target-controller family. Do not infer either from auxiliary
resource writeback.
