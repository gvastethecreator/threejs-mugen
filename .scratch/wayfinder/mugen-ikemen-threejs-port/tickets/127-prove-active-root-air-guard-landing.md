# Prove Active-root Air Guard Landing

Type: implementation
Status: open
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can progress from the closed A-only guard contact through the existing fixture-owned Common1-style `154 -> 155 -> 52 -> 20` landing route without widening generic aerial physics or gameplay ownership.

## Acceptance

- Preserve Feature125 A-only contact, all closed ground guard evidence, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range; P4 is the only P3 direct contact source and produces exactly one zero-chip A guard.
- Route held-back P3 through fixture `40/A`, automatic `132/A`, direct guard `154/A`, bounded guard slide `155/A`, explicit landing `52/S`, and controlled standing/walk return `20/S`.
- Require active-root controller order for `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState`, plus controllers-before-kinematics schedule evidence.
- Keep generic `physics = A` landing, exact Common1/IKEMEN timing, generic jumping/movement, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-air-guard-exit-and-landing-map.md`

## Claim Ceiling

Allowed: one normal-tick direct A-only active-root guard can progress through a fixture-owned authored air guard exit and landing route under the current active-motion scheduler.

Blocked: generic aerial physics or landing, exact Common1/IKEMEN timing, complete guard policy, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.
