# IKEMEN Tag member and leader order

## Question

How do Tag `memberno` and `leader` relate to stable PlayerNo, mutable member order, team mode, and same-tick partner selection?

## Answer

`memberno` addresses a one-based mutable order position and swaps the caller into that position. TagIn `leader` addresses one-based stable PlayerNo, rotates that same-side root to the front, sinks dead members, and updates both leader identity and every mutable member position. Stable player slots remain unchanged. The sandbox needs a distinct Tag team-order model before executing either controller parameter.

## Sources

- Pinned TagIn/TagOut parameter conversion: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5241-L5397>
- Pinned team order and leader functions: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6089-L6250>

## Findings

- Both parameters are converted from one-based CNS values to zero-based engine values.
- `changeTagOrder` runs only in Tag mode, validates the destination against current team length, swaps current/target mutable positions, then rewrites every root's member position.
- `changeTagLeader` runs only in Tag mode, treats its value as stable PlayerNo, requires same-side parity and an existing root, rotates the chosen root to the front, sinks dead members, updates `teamLeader`, then rewrites member positions.
- Team order is reconstructed from stable same-side PlayerNo slots sorted by mutable `memberNo`.
- Current `RuntimeTeamRoster/v0` and `RuntimeRootSelection/v0` derive side from stable ids and expose no team mode, member position, or leader identity.
- Current Tag partner selection is stable-slot caller-relative. Mutating member order must not silently change that selector unless a separate official source proves it should.

## Local implication

Create `RuntimeTagTeamOrder/v0` as a separate explicit-Tag model. Preserve stable root ids, store side-local mutable order and leader id, provide atomic swap/rotation operations, reset deterministically, and publish diagnostics. Do not route scheduler, selection, gameplay, or rendering through it until each consumer is separately specified.

## Uncertainty

Exact dead-member rotation behavior across round reset and whether user-authored team setup can begin with non-slot order need later fixtures. Controller compilation remains blocked until the model exists.
