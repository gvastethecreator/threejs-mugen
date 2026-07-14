# Research: Dizzy Break Transition

## Decision

Implement the first dizzy break slice as an imported direct-hit transition:
when a defender's actor-local dizzy points cross from a positive value to zero,
the runtime may enter the available common `StateDizzy` route. An explicit
`p2stateno` remains authoritative, and an unavailable common state fails
closed.

Official IKEMEN-GO `common.const` defines the default dizzy animation and state
as `AnimDizzy = 5300` and `StateDizzy = 6565300`; the same file also defines
separate guard-break state ids. The character-features documentation describes
`[Constants]` overrides for these common defaults:
[common.const](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/data/common.const),
[Character features](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features).

## Implementation Boundary

- `DizzyStateSystem` owns the default state id and availability predicate rather
  than embedding state lookup in combat math.
- Direct combat captures the pre-hit dizzy value and requests a transition only
  for a positive-to-zero crossing.
- Runtime resolution applies the transition after generic `p2stateno` and
  default get-hit handling, only for imported actors, only without explicit
  `p2stateno`, and only when `canEnterState` accepts `6565300`.
- The required trace registers a synthetic imported fighter with the common
  state and animation available. Its actor-frame evidence proves zero even
  though canonical final snapshots omit resource fields at zero.

## Evidence and Deferred Work

The focused state-system, direct-combat, runtime-resolution, and required trace
tests pass for this route. Full corpus regeneration and repository-wide gates
are intentionally batched. Explicit `p2stateno` coverage, unavailable-state
coverage, repeated zero-floor trace coverage, red-life `LifeShare`, team/helper
sharing, reset/persistence, HUD, rollback/netplay, native breadth, and full
MUGEN/IKEMEN parity remain separate gates.

The controller-order boundary is consistent with the official changed
controller reference, which documents state-controller behavior and the
specialized combat/resource parameters:
[State controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29).
