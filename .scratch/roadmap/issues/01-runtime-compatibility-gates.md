# 01 - Runtime Compatibility Gates

Status: ready-for-agent
Labels: runtime-trace, mugen-compat, ready-for-agent

## Objective

Keep converting partial CNS/CMD/runtime behavior into typed operations, named runtime systems, deterministic trace artifacts, and honest compatibility docs.

## Next Useful Cuts

- Current queue labels in `docs/ROADMAP_EXECUTION_BOARD.md`: R1 KFM/Common1 recovery precision, R2 MatchWorld ownership deepening.
- Latest completed R2 cut: `RuntimeEnvColorWorld` now owns bounded `EnvColor` event history, stage-flash projection, and reset consumed by `PlayableMatchRuntime`, preserving existing stage-frame color/opacity trace behavior through focused `EnvColorSystem` tests.
- Latest completed R1 cut: optional `kfm-official-default-fall-recovery-threshold.json` checksum `891d0f6d` confirms the private official KFM fixture reaches state `5050` while `hitFall.recoverTime` is still positive, then routes through ground recovery `5200 -> 5201 -> 52 -> 0` after `command = "recovery"` is accepted near the ground; the gate now also requires ordered actor-frame evidence where that positive `5050` observation precedes `5200` with `recoverTime = 0`. This relies on local fixture presence and does not claim public broad compatibility.
- Previous completed R2 cut: `RuntimeAudioWorld` now owns bounded `PlaySnd`/`StopSnd` event insertion consumed by `PlayableMatchRuntime`, preserving the same actor sound-event history for Web Audio/debug/trace consumers through focused `AudioEventSystem` tests.
- Previous completed R2 cut: `RuntimeEnvShakeWorld` now owns bounded EnvShake/FallEnvShake event insertion plus deterministic multi-actor camera-shake projection consumed by `PlayableMatchRuntime`, preserving the same actor event history for renderer/debug/trace consumers through focused `EnvShakeSystem` tests.
- Previous completed R2 cut: `RuntimePauseWorld` now owns current match pause state, snapshot projection, source-movetime checks, countdown ticks, controller application, and reset while preserving existing `Pause`/`SuperPause` trace behavior through focused `PauseSystem` / `PlayableMatchRuntime` tests.
- Previous completed R2 cut: `RuntimeTargetWorld.snapshotRuntimeState` now owns cloned target-memory snapshots consumed by `MatchWorld` actor records, with focused `TargetSystem` / `MatchWorld` / `DebugPanel` tests proving target refs, TargetBind bindings, and `BindToTarget` snapshots still render through the registry.
- Previous completed R2 cut: required `synthetic-imported-round-timeover.json` checksum `7d9f7907` uses a short `roundTimerFrames` fixture to gate bounded `RoundSnapshot` `timeover` draw/winner/message/timer evidence through `RuntimeTraceGate.requiredRoundFrames`. Current aggregate: 146/146 artifacts passed, 128 required and 18 optional.
- Previous completed R2 cut: required `synthetic-imported-round-ko.json` checksum `bfd5f073` uses `RuntimeTraceGate.requiredRoundFrames` to gate bounded `RoundSnapshot` KO state, winner, message, timer evidence, and final P2 life `0`.
- Previous completed R2 cut: `RuntimeRoundSystem` owns bounded round timer, KO/time-over finish decision, winner/message snapshot projection, and reset behavior with focused unit coverage. This is ownership cleanup only; no MUGEN/IKEMEN round parity claim.
- Latest completed cut: required `synthetic-imported-default-fall-recovery-tick-order.json` checksum `e2691aab` gates ordered actor-frame evidence for `5050` with positive `hitFall.recoverTime` before `5210` with `recoverTime = 0` on the bounded recovery-input route.
- Previous completed cut: required `synthetic-imported-default-fall-air-recovery-velocity.json` checksum `560f6308` gates bounded air-recovery velocity telemetry in `5210` after `CanRecover` plus `command = "recovery"`.
- Previous completed cut: required `synthetic-imported-default-fall-ground-recovery.json` checksum `7945fd93` gates bounded near-ground recovery selection: imported defender `5050` routes through `5200 -> 5201 -> 52 -> 0` with `SelfState`, `VelSet`, `PosSet`, and actor-frame velocity evidence for synthetic `velocity.air.gethit.groundrecover.*` constants.
- Previous completed cut: required `synthetic-imported-default-fall-recovery-threshold.json` checksum `7bb15a5f` gates actor-frame recovery countdown handoff: imported defender `5050` is observed with positive `hitFall.recoverTime`, then `5210` is observed with `recoverTime = 0` after `CanRecover` plus `command = "recovery"` routes.
- Previous completed cut: optional `kfm-official-default-fall-recovery-too-early.json` checksum `878b10b5` confirms the bounded early recovery-input reject window against real KFM/Common1 when the private fixture exists: `command = "recovery"` is active before the bounded recovery timer permits it, states `5210`, `5200`, and `5201` are forbidden, and the defender remains in `5050`.
- Previous completed cut: `synthetic-imported-default-fall-recovery-too-early.json` checksum `050e7e3c` gates the same bounded Common1-style early recovery-input rejection without requiring the private fixture.
- Previous completed cut: `synthetic-imported-assertspecial-guarddeny.json` checksum `f636748d`, `synthetic-imported-assertspecial-crouch-guarddeny.json` checksum `e47a0cb1`, `synthetic-imported-assertspecial-air-guarddeny.json` checksum `62179385`, and `synthetic-imported-assertspecial-lifetime.json` checksum `181ded30` gate bounded defender-side `NoStandGuard` / `NoCrouchGuard` / `NoAirGuard` hit-over-guard evidence plus one-frame `NoStandGuard` expiry into later guard.
- Next recommended gate: broader recovery parity, exact controller/VM tick-order inside the controller loop beyond summarized actor-frame sequences, or a broader guard/AssertSpecial confirmation. Threshold handoff, optional KFM ordered-threshold confirmation, bounded actor-frame tick order, and bounded synthetic air/ground velocity now have evidence; exact parity remains blocked.
- Alternate recommended gate: broader `AssertSpecial` priority/KFM confirmation/pause layering, or a narrower raw-controller family promotion to required trace evidence.
- Add required traces for controller families currently covered only by unit/runtime tests.
- Previous completed cut: `synthetic-imported-control.json` gates partial static `CtrlSet` typed control evidence and final owner-control telemetry with checksum `80c4c446`; previous `synthetic-imported-kinematic.json` gates partial static `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd` typed kinematic evidence and bounded actor position/velocity telemetry with checksum `92804390`.
- Continue shrinking raw controller fallback paths into typed `ControllerOp` execution.
- Move mutable behavior behind named systems before adding broader parity claims.
- Prefer KFM/Common1 precision when a synthetic gate already exists for the same family.

## Acceptance

- Code has focused tests or a required `pnpm qa:trace` artifact.
- Trace checksum drift is intentional and documented.
- `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/SUPPORTED_FEATURES.md`, `docs/WORKPLAN.md`, and `docs/BUILD_EXECUTION_BACKLOG.md` are updated.
- `docs/ROADMAP_EXECUTION_BOARD.md` is updated if R1/R2 queue status changes.
- Claim allowed / claim blocked wording is explicit.

## Blocked Claims

- Full CNS VM parity.
- Full helper/custom-state/redirect/team ownership.
- Full IKEMEN runtime behavior.
- Exact tick order beyond the bounded actor-frame sequence without fixture-backed evidence.
- Full round/lifebar/team/screenpack parity from the bounded `RuntimeRoundSystem` ownership cut.
- Exact KO slowdown, time-over duration, intro/winpose, round transition, lifebar, team, simul/tag/turns, and screenpack parity from the bounded `synthetic-imported-round-ko` / `synthetic-imported-round-timeover` trace gates.
- Full target redirect/team/helper ownership or exact MUGEN/IKEMEN target semantics from the `RuntimeTargetWorld.snapshotRuntimeState` ownership cut.
- Exact MUGEN/IKEMEN pause layering, super backgrounds, sound/spark timing, helper VM pause behavior, or rollback/netplay timing from the `RuntimePauseWorld` ownership cut.
- Exact EnvShake pause/stage/layer interaction, helper/redirect ownership, waveform parity, or full presentation parity from the `RuntimeEnvShakeWorld` ownership cut.
- Exact audio timing, mixing, channel priority/arbitration, loops, pan, volume, helper/redirect ownership, or full MUGEN/IKEMEN sound parity from the `RuntimeAudioWorld` ownership cut.
- Exact EnvColor blend math, layer/window ordering, pause timing, renderer parity, or full MUGEN/IKEMEN presentation parity from the `RuntimeEnvColorWorld` ownership cut.
