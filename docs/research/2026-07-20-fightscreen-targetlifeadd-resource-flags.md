# FightScreen TargetLifeAdd resource flags

Date: 2026-07-20
Ticket: T335
Status: implemented at bounded TargetLifeAdd resource scope

## Research result

The pinned Ikemen-GO source gives `TargetLifeAdd` two resource switches,
`dizzy` and `redlife`, and defaults both to enabled. It evaluates the
controller on the caller, resolves target records through the redirected
memory owner, and mutates the selected receiver. The receiver's active hit
attribute selects the default or super resource multiplier.

## Implementation

The compiler now emits typed `dizzy` and `redLife` flags. The target world
passes target constants through root and Helper dispatch, applies the red-life
and dizzy-point effects from the effective life delta, respects
`NoDizzyPointsDamage`, and stores the controller `kill` value in `hitVars`.
The existing local resource clamp remains the final bound for red life and
dizzy points.

## Evidence

- Compiler coverage checks the enabled defaults.
- Target-system coverage checks default normal multipliers, super constants,
  explicit flag switches, and `hitVars.kill`.
- Focused result: 4 files / 390 tests passed.
- TypeScript 7 typecheck passed.
- Diff hygiene passed.
- Renderer/UI paths did not change, so visual smoke is deferred.

## Open work

The next resource boundary is separate source review for
`TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd`.
WinType cause attribution for these resources, nested Helper ancestry,
reversal, exact target order, direct screenpack proof, and full parity remain
open.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
