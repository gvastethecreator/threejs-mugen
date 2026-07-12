# Execute Active-root Motion Phase

Type: implementation
Status: open
Blocked by: None

## Goal

Move a live non-standby P3-P8 root through restricted CNS, local kinematics, and animation on explicit IKEMEN Tag normal ticks without granting any pair-owned gameplay or presentation phase.

## Acceptance

- Snapshot `playable`, `active-motion`, and `bounded-standby` root phases before the normal actor pass; no same-pass capability escalation.
- Add a motion-CNS allowlist containing existing bounded operations plus kinematic controllers, with no side-effect route.
- Execute state clock, motion CNS, kinematics, then animation for `active-motion` roots; keep P1/P2 playable order unchanged.
- Keep direct input/AI, Pause/hitpause widening, sprite/effect lifecycle, hit/contact/recovery, combat, round, presentation, audio, HUD, and resources unchanged.
- Version/reconcile public phase capabilities and fail closed on disabled, non-player, invalid-side, over-KO, legacy, Single, and drifted inputs.
- Prove next-tick activation, motion/animation, blocked same-pass/opposite-side/standby/Pause/effect routes, reset, detached reads, and historical checksum stability.
- Promote one synthetic imported active-root motion artifact to required; pass full tests, TypeScript 7, build, trace, boundaries, and diff gates.
- Update report, roadmap, workplan, progress, backlog, and issue 07. Browser smoke is N/A while presentation remains false.

## Claim Ceiling

Allowed: bounded imported-CNS-driven P3-P8 local motion and animation on normal explicit Tag ticks.

Blocked: direct native control/AI handoff, same-frame promotion parity, Pause/hitpause motion, stage clamp/push, visible Tag, effects, targets, combat, round, camera, HUD, audio, resources, ZSS/Lua, rollback, netplay, scores, or full IKEMEN parity.
