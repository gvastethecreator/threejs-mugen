# IKEMEN Active-root Hit-admission Runtime Report

Date: 2026-07-12
Wayfinder: 107

## Delivered

- Added pure `RuntimeRootDirectHitAdmissionWorld` over authoritative runtime roots.
- Added deterministic ReversalDef, active-HitDef, PlayerNo/id attacker ordering.
- Added fail-closed actor/id/PlayerNo validation and explicit eligibility filters.
- Added per-pair admission reasons for team, move, repeated contact, HitBy/NotHitBy, Clsn, and overlap.
- Added `RuntimeRootPhaseCapabilities/v4.hitAdmission` while keeping reserve `combat=false`.
- Added detached snapshot/trace artifact diagnostics and actor-scoped pre-combat schedule evidence.
- Preserved exact pair/Single resolver calls and all combat mutation owners.
- Cleared diagnostics on normal tick entry, pause, hitpause, and reset.

## Proof

- Focused: 7 files / 764 tests.
- Full suite: 178 files / 1812 tests.
- TypeScript 7 typecheck: passed.
- Trace gates: 543/543 artifacts (512 required, 31 optional).
- Production build: 260 modules, 1,614.19 kB JS / 405.57 kB gzip; existing chunk-size warning only.
- Modular boundaries: passed.
- Diff audit: passed before commit.
- Browser smoke: N/A; renderer, camera, HUD, Studio, CSS, and visible assets did not change.

## Claim

Allowed: deterministic read-only active-root direct-hit admission evidence for explicit IKEMEN Tag.

Blocked: hit/guard/reversal/HitOverride mutation, targets, juggle, priority mutation, helpers/projectiles, throws, resources, round/HUD/audio, scores, and full MUGEN/IKEMEN parity.
