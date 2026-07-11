# IKEMEN multi-root registry ownership

## Question

What registry can expose multiple roots publicly before the pair scheduler is expanded?

## Answer

IKEMEN owns a complete character list separately from root/helper slot storage and rebuilds ordered run lists from it. The browser runtime therefore needs a complete observable character registry before widening scheduler ownership. The safe expand path keeps the current P1/P2 scheduler tuple intact while a parallel unique-id registry feeds topology and public snapshots.

## Primary sources

- [IKEMEN GO CharList creation and run-order ownership](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12862-L12930)
- [IKEMEN GO root/helper player slots](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4968-L5009)

## Implementation decision

- Preserve `RuntimeMatchActorRoster.actors` as `[p1, p2]` for current behavior.
- Add `createCharacterRegistry(...)` with stable order, unique ids, lookup, topology, and diagnostics.
- Add `teamRoster` plus side indexes to `MatchWorldActorRegistrySnapshot` from player/helper records only.
- Prove P1-P4 plus helper through the public snapshot builder.

## Uncertainty

Live standby/disabled/over-KO/player-type state, a live multi-root `MatchWorld` instance, multi-root construction, scheduler phases, input, effect stores, combat, round ownership, and presentation remain unimplemented.
