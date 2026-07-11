# IKEMEN Helper character identity lifecycle

## Question

When must a Helper receive and lose PlayerID, what PlayerNo does it expose, and how should a match reset affect the identity space?

## Answer

IKEMEN creates a Helper with the parent's PlayerNo slot, assigns a new global character ID before adding it to the shared `CharList`, records the parent ID, and inserts the Helper into the same ID map used by roots. `ID` reads that character ID; `PlayerNo` reads the one-based root slot. Character deletion removes the exact object from the ID map. Clearing the character list resets the ID allocator to the configured HelperMax baseline and invalidates stale IDs, so reset is a new identity epoch rather than continuation of the prior Helper sequence.

## Primary sources

- [Pinned Helper creation, inherited player slot, parent ID, PlayerID allocation, and CharList insertion](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6752-L6806)
- [Pinned CharList clear, baseline reset, add, and exact-object delete](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12920-L12980)
- [Pinned `ID` trigger reads character ID](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2247-L2251)
- [Pinned `PlayerNo` trigger returns the one-based player slot](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L3448-L3452)
- [Pinned global PlayerID lookup rejects destroyed or disabled characters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)

## Local audit

- Helpers are effect actors identified publicly by `serialId`; that id remains separate from numeric PlayerID.
- Every supported Helper creation/removal route passes through `RuntimeEffectActorWorld`, but it previously exposed no lifecycle observer.
- Helper trigger and runtime-controller contexts already carried Parent/Root state and team side, but no numeric self/parent/root identity.
- Match reset clears Helper stores and resets serial counters. Rebuilding the numeric registry at the same boundary preserves root values and prevents stale Helper registration conflicts.
- Helper-created Helpers are not executable in the current Helper controller subset, so nested-parent runtime behavior remains a later compatibility gate.

## Implementation decision

1. Publish world-owned Helper spawn/removal events without changing scheduling.
2. Register root-created Helpers before same-tick discovery and inherit root PlayerNo explicitly.
3. Carry separate self/parent/root PlayerID fields into both trigger and runtime-controller evaluation.
4. Unregister on every world-owned removal and rebuild the registry on match reset.
5. Keep Helper Tag RedirectID mutation blocked until its source behavior is mapped independently.

## Uncertainty

Preserved Helpers across rounds, Helper-created Helper state ownership, disabled lifecycle writers, Helper RedirectID Tag behavior, generic controller redirects, and exact MUGEN-versus-IKEMEN reset distinctions remain open.
