# IKEMEN Active-root Diagnostic Collision Runtime Report

Date: 2026-07-12
Wayfinder: 103
Verdict: passed

## Delivered

- `RuntimeRootPresentation/v1` adds independent collision-debug reasons and exact ordered ids.
- Three.js strictly resolves selected roots across `actors` and `reserveActors`.
- `CollisionBoxRenderer` exposes actor, hitbox, and hurtbox diagnostics.
- Trace evidence requires exact collision ids without changing behavior checksums.
- Browser smoke gates handoff, reset, stale cleanup, visible boxes, and nonblank desktop/mobile canvases.

## Evidence

- Focused tests: 19 renderer/presentation/snapshot tests plus 5 focused trace tests passed.
- Full tests: 176 files / 1798 tests passed.
- Trace: 543/543 artifacts passed; existing presentation checksum remains `97255586`.
- Browser: baseline/reset `p1,p2`; desktop/mobile handoff `p3,p2`; two collision boxes; 1006/1163 unique canvas colors.
- Build: TypeScript 7 and Vite passed; bundle 1,609.20 kB with the existing large-chunk warning.
- Architecture: boundaries and `git diff --check` passed; screenshots were visually inspected.

## Audit

`collisionRootIds` is consumed only by the renderer collision resolver and trace/snapshot evidence. It does not enter `RuntimeActorConstraintWorld`, direct/projectile combat, targets, effects, HUD/audio, round, or resources. Effect collision actors keep their prior path. Duplicate snapshot ids, duplicate requested ids, and unknown ids fail closed.

## Remaining

Wayfinder 104 maps plural body push. Standby Clsn2 classification, size boxes, actor axes, exact palette/text/rotation/localcoord, hit admission, targets, multi-root combat, and exact Tag choreography remain open. Scores do not move.
