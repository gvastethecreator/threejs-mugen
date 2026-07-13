# IKEMEN Active-root Air Guard Exit And Landing Map

Date: 2026-07-12

## Question

What bounded source-backed route can prove one active IKEMEN Tag root exits an A-only air guard contact through landing without claiming generic aerial movement or exact Common1/IKEMEN timing?

## Primary Sources

- [Elecbyte CNS format: StateDef physics](https://elecbyte.com/mugendocs/cns.html): `physics = A` accelerates downward and lands on ground contact; `physics = N` leaves acceleration and landing detection to authored controllers.
- [Elecbyte CNS format: state controller order](https://elecbyte.com/mugendocs/cns.html): controllers run in declared order each state tick; positive Y moves downward and ground level is Y zero.
- [Elecbyte State Controller Reference: HitDef airguard.velocity and airguard.ctrltime](https://elecbyte.com/mugendocs/sctrls.html): air guard has its own velocity and control-time parameters.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11791-L11803): after position update, physics-A descending contact enters state `52`.

## Local Ownership Map

- `RuntimeTraceGatePresets.defaultGuardHitBlock` already models bounded imported Common1-style air guard states `154` and `155` as `type = A`, `physics = N`. Its landing option uses authored `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState` into `52`; `defaultLandStateBlock` owns `52/S,S` control restoration and return to state `0`.
- Required `synthetic-imported-air-guard-landing` already proves the pair-owned synthetic route `154 -> 155 -> 52 -> 20`. It is valuable baseline evidence but cannot establish active-root scheduling.
- `ACTIVE_MOTION_ROOT_CNS_CAPABILITIES` admits the needed state and kinematic controllers. `RuntimeRootMotionAdvanceWorld` executes state clock, controllers, kinematics, animation, and constraints for active roots.
- Active-root ordering differs from the full P1/P2 fighter advance: controller execution is before kinematics. `PlayableMatchRuntime.advanceActiveRootMotion` passes imported roots through the same kinematics and imported-state preservation policy, so H-state guard slide must use its authored state `155` landing exit rather than rely on generic kinematic state reset.

## Decision

Use the existing fixture-owned landing state blocks, not `physics = A`, and extend the required active-root A-only contact into `154/A,N -> 155/A,N -> 52/S,S -> 20/S,S`. Require P4 -> P3 guard/contact provenance, the controller sequence, and active-root schedule stamps. Keep P2 far and avoid new motion or renderer behavior.

## Evidence Limits

- This cut does not prove generic `physics = A` landing, exact Common1/IKEMEN landing timing, or arbitrary external state behavior.
- It does not widen projectile/helper threats, custom state, forceguard, target precedence, Pause/hitpause, effects, audio, presentation, team lifecycle, score movement, rollback, or full parity.
- Existing pair-owned air-guard landing evidence remains separate; the new requirement exists only to prove active-root ownership composition.
