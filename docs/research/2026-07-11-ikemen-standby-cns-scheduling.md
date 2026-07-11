# IKEMEN standby-root CNS scheduling research

## Source finding

Pinned IKEMEN prepares and executes the complete character list. Disabled characters return early, but standby is not a global CNS freeze. TagIn and TagOut mutate standby during controller execution, so selection derived before the full tick can become stale.

Primary anchors at revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:

- [Character preparation and execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11808)
- [Complete run-order action loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175)
- [TagIn and TagOut controller execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5397)

## Local architecture finding

`PlayableMatchRuntime.actorRunOrderCandidates()` currently contains P1/P2 plus their Helpers. `RuntimeMatchActorAdvanceWorld` calls `advanceFighter` for every root. That function bundles state clock, constraints, stun, move lifecycle, kinematics, animation, controllers, recovery, sprite effects, and hit eligibility. Adding P3-P8 there would silently grant more than CNS scheduling.

## Decision

1. Extract a named CNS execution boundary with explicit capability/participation input.
2. Preserve P1/P2 behavior and trace checksums through the extraction.
3. Admit P3-P8 to explicit IKEMEN run order through the new boundary while other consumer flags remain false.
4. Rebuild selection after controller-driven standby changes.
5. Add bounded TagIn/TagOut only after same-tick invalidation is observable.

This research authorizes no runtime support or score movement by itself.
