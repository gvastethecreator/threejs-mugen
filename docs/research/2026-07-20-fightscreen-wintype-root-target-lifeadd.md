# FightScreen root TargetLifeAdd cause

Date: 2026-07-20
Ticket: T333
Status: implemented at bounded root TargetLifeAdd scope

## Research result

Ikemen-GO resolves `RedirectID` before reading target memory. The selected
memory owner performs `TargetLifeAdd` against its target list, while the target
receiver owns the life-zero transition. This separates source identity from
the selected victim and requires pre-life evidence at dispatch time.

## Implementation

`RuntimeTargetControllerDispatchWorld` now captures candidate life values and
reports selected `TargetLifeAdd` targets after the operation. Root active and
State -1 paths admit the result cause only when the source actor and victim are
both members of the active root pair. Hit-state metadata keeps its existing
source arbitration; non-hit root transitions use source root identity,
retained guard/attribute context, and a bounded normal fallback.

Helpers and non-root target actors continue to receive the resource change.
Their result attribution stays closed until parent, root, target memory, and
player-slot identity can be checked together.

## Evidence

- `PlayableMatchRuntime.test.ts` covers active redirected and State -1 root
  `TargetLifeAdd` KOs.
- `TargetSystem.test.ts` keeps target selection and resource behavior green.
- Focused result: 3 files / 316 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.
- Renderer/UI paths did not change, so visual smoke is deferred.

## Open work

The next boundary is first-generation Helper target-resource provenance. The
port still needs explicit Helper root, parent, destination, selected target,
and inherited player-slot evidence before extending win-type attribution.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
