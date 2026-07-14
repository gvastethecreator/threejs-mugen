# Research - Dizzy points runtime

Date: 2026-07-14
Status: source-backed bounded runtime decision

## Question

What is the smallest source-aligned dizzy-point slice after auxiliary-resource
ownership projection, without claiming default formulas, break transitions, or
HUD parity?

## Primary evidence

- The official [IKEMEN-GO new state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
  defines `DizzyPointsAdd` and `DizzyPointsSet` as separate writes to the
  player's dizzy points.
- The official [IKEMEN-GO changed state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
  defines HitDef `dizzypoints`, `NoDizzyPointsDamage`, and a distinct
  `AttackMulSet DizzyPoints` route.
- The official [IKEMEN-GO character features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Character-features)
  documents `[Data] dizzypoints` as the starting amount, defaulting to life,
  and keeps it separate from `[Data] guardpoints`.

## Decision

Implement actor-local dizzy points as a bounded resource:

- authored `[Data] dizzypoints` max, then life max fallback;
- fighter and Helper initialization with independent value/max state;
- typed `DizzyPointsAdd` and `DizzyPointsSet` with `[0, max]` clamping;
- explicit HitDef `dizzypoints` on successful direct hits only, with signed
  attack/defence scaling and no guarded-gauge mutation;
- explicit snapshot/projection/trace evidence and behavior-checksum inclusion
  only when the value differs from the default sentinel.

Signed resource scaling is intentional: a HitDef amount can lower an existing
gauge, while the resource boundary still clamps the resulting actor-local
value.

## Acceptance

- dynamic and static controller forms compile, execute, and record typed
  `resource:dizzypointsadd` / `resource:dizzypointsset` telemetry;
- imported HitDef parsing and direct combat produce actor-local updates;
- Helpers carry the same local state without widening the team bank;
- `synthetic-imported-dizzypoints` proves the route with checksum `00d3b052`;
- explicit IKEMEN projection reports dizzy points as available without changing
  legacy/unknown snapshots;
- no existing behavior checksum changes outside the new required artifact.

## Claim boundary

Allowed: bounded actor-local initialization, Add/Set, explicit HitDef amount,
signed scaling, direct-hit mutation, Helper plumbing, projection, and trace
evidence.

Blocked: omitted HitDef default formula, `NoDizzyPointsDamage`,
`AttackMulSet DizzyPoints`, dizzy/break state transitions, target/projectile or
team sharing, reset/persistence, HUD bars, rollback/netplay, and full
MUGEN/IKEMEN parity.
