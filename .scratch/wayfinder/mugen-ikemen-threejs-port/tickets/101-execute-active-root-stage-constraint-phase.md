# Execute Active-root Stage Constraint Phase

Type: implementation
Status: resolved
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

## Result

Actor-local active-root constraints now run after animation through existing stage-X clamp semantics. `RuntimeRootPhaseCapabilities/v2` publishes the owner and tick diagnostics record `fighter:constraints` per actor. Required checksum `870f8871` proves exact P3 boundary `x = -154` with zero target/effect/combat widening. Full evidence: `docs/reports/2026-07-12-ikemen-active-root-stage-constraint-runtime.md`.
