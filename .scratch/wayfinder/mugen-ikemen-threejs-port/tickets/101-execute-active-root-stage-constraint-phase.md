# Execute Active-root Stage Constraint Phase

Type: implementation
Status: ready
Blocked by: None

## Goal

Clamp already-live explicit-Tag P3-P8 active-motion roots to current sandbox stage X bounds through an actor-local observable phase without granting push or combat.

## Acceptance

- Add explicit root constraint capability; do not infer it from kinematics, presentation, or combat.
- Run existing stage clamp after each active root's kinematics and animation.
- Record actor-scoped `fighter:constraints` ordering and reject cross-root masking.
- Preserve P1/P2, legacy, unknown, Single, standby, disabled, same-pass TagIn, Pause/hitpause, and reset behavior.
- Prove exact boundary clamp plus `ScreenBound bound = 0` opt-out.
- Required trace proves P3 exceeds a boundary before clamp, final X equals boundary, and combat/effect/target evidence is absent.
- Pass full tests, TypeScript 7, build, traces, boundaries, diff audit, docs/report updates, and commit.

## Claim Ceiling

Allowed: bounded active-root stage-X clamp using current sandbox semantics.

Blocked: plural push, collision-debug widening, combat/targets/effects, exact IKEMEN bounds/localcoord/Z parity, Tag choreography, scores, or full collision parity.
