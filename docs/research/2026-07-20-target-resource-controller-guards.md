# Target resource controller guards

Date: 2026-07-20
Tickets: T336, T337, T338
Status: implemented at bounded target-resource scope

## Research result

The pinned Ikemen-GO bytecode gives all three target resource controllers an
`absolute` parameter. The receiver methods then apply distinct guards:
`TargetRedLifeAdd` checks `NoRedLifeDamage`, `TargetGuardPointsAdd` checks
`NoGuardPointsDamage`, and `TargetDizzyPointsAdd` checks both the dizzy state
and `NoDizzyPointsDamage`. Red life uses the receiver life bound; guard and
dizzy points use the unbounded resource path.

## Implementation

The compiler and typed target operations now carry `absolute` for guard and
dizzy resources. The target world mirrors the receiver-side value calculation,
including defense scaling and the red-life bound. AssertSpecial parsing now
publishes the two missing resource guards, and target execution honors all
three guards.

## Evidence

- Compiler tests cover the source defaults.
- Target-system tests cover scaled and absolute writes plus all three guards.
- Focused result: 5 files / 401 tests passed.
- TypeScript 7 typecheck passed.
- Diff hygiene passed before commit.
- Renderer/UI paths did not change, so visual smoke is deferred.

## Open work

WinType attribution for non-life target resources, reversal/reflection,
exact target ordering, nested Helper ancestry, direct screenpack proof, and
complete MUGEN/IKEMEN parity remain open.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
