# ADR 0053: Bounded FightScreen intro-skip character reset

- Status: Accepted for bounded implementation
- Date: 2026-07-18
- Entry: 562 / T288
- Code: `a12a2672`

## Context

Ikemen's intro skip has a second event after the T287 shutter request: the
source resets each character's transient state at a shutter timer boundary.
Folding that behavior into the renderer or into the initial skip request would
hide ordering and resource-ownership errors.

## Decision

Keep the reset as a timer-owned event with these boundaries:

1. `RuntimeRoundSystem` detects and consumes the source-shaped shutter edge.
2. `RuntimeMatchRoundWorld` exposes the edge before the active actor pass.
3. `PlayableMatchRuntime` resets roots in place, preserving external object
   identity and persistent round resources.
4. `RuntimeEffectActorWorld.resetOwner` removes only the resetting root's
   effect actors and notifies helper lifecycle observers.
5. The existing state-entry path enters state `0` after the transient reset.

The reset contract includes position, velocity, idle animation, control,
state/target/hit/guard transient state, command history, per-actor event
buffers, contact memory, and owner-scoped helpers/projectiles/explods. It keeps
life, power, guard/dizzy/red-life, vars/fvars, team state, and compatibility
history.

## Rejected alternatives

- Reset the actors in the input-edge handler: rejected because source timing
  owns the reset after the shutter edge, not the initial button event.
- Reuse full match reset: rejected because it would erase round resources,
  variables, team state, timer context, and unrelated owners.
- Reset the global effect world: rejected because the source event is applied
  per character and global FightScreen effects have separate ownership.
- Claim exact `clearPlayerAssets`: rejected until the complete asset/effect
  inventory and release choreography have independent evidence.

## Consequences

The skip path now has a deterministic actor-reset event and no longer leaves
intro motion, command history, or owner-scoped effects behind the shutter. The
implementation remains intentionally bounded and does not add announcement or
round/fight display suppression.

## Verification

Focused 5-file / 392-test Vitest run and TypeScript 7 typecheck pass. Broad
build, trace, browser, and release gates remain part of the next grouped
checkpoint. Scores remain unchanged.
