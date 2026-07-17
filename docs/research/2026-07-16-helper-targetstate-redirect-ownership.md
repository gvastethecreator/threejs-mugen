# Research: Helper-destination TargetState ownership

Date: 2026-07-16

Question: can helper-destination `TargetState` leave its fail-closed boundary
without inventing state-program ownership or changing target-memory semantics?

## Answer

Yes, at bounded scope. `RedirectID` executes `TargetState` against the
destination helper's target memory. The state-program owner is the destination
helper's character root, matching IKEMEN-GO's current `stateOwner()` behavior.
This slice supports selected root fighter actors. If the destination helper's
target memory selects another helper, the route remains fail-closed until the
runtime has a helper state-entry/clock/commit contract.

## Official sources

- [IKEMEN-GO RedirectID wiki](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as sending state-controller execution to the player with
  the designated PlayerID and notes that it applies to legacy controllers.
- [IKEMEN-GO `src/char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
  contains the current `targetState` implementation: it derives the state
  owner player number from the executing actor's state block, with the
  `-2`/`-4` exception, then calls `stateChange1` on each target. The same file's
  `stateOwner()` implementation returns the root character; its comment notes
  that MUGEN's debug text may differ, so this port follows the IKEMEN-GO
  compatibility profile explicitly.

## Repository facts

- `PlayableMatchRuntime.resolveHelperTargetRedirect` already resolves a live
  root or helper destination, projects that destination's target memory, and
  rejects stale/destroyed identities through the redirect lease.
- The same resolver currently marks helper-destination `TargetState` as
  unsupported, even though `RuntimeMatchHelperTargetStateWorld.enterRedirected`
  can accept an explicit state owner.
- `RuntimeTargetStateEntryWorld` resolves a target's state owner before checking
  the state table. `enterHelperRedirectedTargetState` currently looks up the
  supplied owner among root fighters, which is the correct shape once the
  destination helper's root is supplied instead of the helper actor.
- Current helper TargetState entry resolves targets through a root-only actor
  roster. Helper actor entry is not yet represented by the fighter state-entry
  clock, animation owner, or wrapper writeback path.

## Decision

Implement helper-destination `TargetState` for this bounded route:

1. destination = live helper selected by `RedirectID`;
2. target store = destination helper's target memory;
3. state owner = root fighter that owns the destination helper;
4. state table/animation owner = that root fighter;
5. selected target = live root fighter only;
6. invalid, stale, destroyed, missing, unsupported, or helper-selected target
   = no state entry and an observable blocked route;
7. existing `SelfState` and custom-state return paths remain owned by the target
   fighter's existing state-entry implementation.

This does not claim helper-target `TargetState`, helper State -1/global-state
scheduling, recursive redirects, multi-target ordering beyond existing
selection evidence, rollback/netplay, or full MUGEN/IKEMEN parity.

## Proof target

- helper-to-helper `TargetState` redirects to a root target and records
  destination helper id plus destination root `stateOwnerId`;
- destination helper target memory remains unchanged except for the existing
  controller semantics;
- a selected root target enters the state from the destination helper's root
  state program;
- an unselected root target remains byte-identical;
- a selected helper target remains fail-closed;
- existing root/helper redirect tests stay green.

## Implementation result

Resolved in `fd1b6133` under ADR 0007. The runtime now admits the bounded
helper-to-helper route: the destination helper's target memory selects a root
fighter, and that fighter enters through the destination helper's root as the
state-program owner. The new synthetic gate
`synthetic-imported-helper-target-state-helper-redirect-golden` passes, the
selected-helper fail-closed TargetSystem case passes, and the existing
helper-to-root/helper-to-helper redirect tests remain green.

The claim remains bounded exactly as specified above; no broad compatibility
score or parity claim changes.
