# FightScreen nested Helper ancestry

Date: 2026-07-20
Ticket: T339
Status: implemented at bounded nested-helper source scope

## Research result

The pinned Ikemen-GO bytecode resolves a redirected target controller to a
live character before applying the target operation. Its character runtime
keeps the target-life mutation and KO flag on that resolved receiver. The
local identity layer also keeps each Helper's root, parent, inherited
PlayerNo, and allocated PlayerID.

That evidence supports a narrow rule for the FightScreen cause bridge: a
nested Helper may carry a KO cause when every parent link reaches its declared
root and every identity field still matches the live registry. The bridge does
not infer a cause from `rootId` alone.

## Implementation

`PlayableMatchRuntime.verifiedRootForHelper` now builds the live Helper index
and follows `parentId` until the root. It rejects missing actors, cycles,
cross-root links, inherited identity mismatches, stale parent PlayerIDs, and
root identity mismatches. The same verifier gates Helper-originated root
self-KO resource attribution.

The production test creates a live parent Helper and a nested child, routes
the child's `TargetLifeAdd` through `RedirectID = 57`, and verifies:

- the child identity points to the parent and root;
- the victim reaches life zero;
- the winning root receives a normal round result;
- redirected telemetry retains the child's actor ID and root destination.

Helper-to-Helper target-life cause attribution remains closed by design in this
slice because the source actor is not the local Helper or a root actor.

## Evidence

- Playable runtime focal: 1 file / 280 tests passed.
- TypeScript 7 typecheck passed.
- Diff hygiene passed.
- No renderer/UI paths changed; browser smoke is not required for this slice.

## Open work

Recursive redirect leases, Helper-victim resource causes, other target-resource
WinType causes, reversal/reflection ownership, direct screenpack proof, and
full MUGEN/IKEMEN parity remain open.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
