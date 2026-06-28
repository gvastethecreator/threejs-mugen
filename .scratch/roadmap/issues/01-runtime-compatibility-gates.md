# 01 - Runtime Compatibility Gates

Status: ready-for-agent
Labels: runtime-trace, mugen-compat, ready-for-agent

## Objective

Keep converting partial CNS/CMD/runtime behavior into typed operations, named runtime systems, deterministic trace artifacts, and honest compatibility docs.

## Next Useful Cuts

- Latest completed cut: `synthetic-imported-default-fall-recovery-too-early.json` checksum `050e7e3c` gates bounded Common1-style early recovery-input rejection: `command = "recovery"` is active before `fall.recovertime` expires, state `5210` is forbidden, and the defender remains in `5050`.
- Previous completed cut: `synthetic-imported-assertspecial-guarddeny.json` checksum `f636748d`, `synthetic-imported-assertspecial-crouch-guarddeny.json` checksum `e47a0cb1`, `synthetic-imported-assertspecial-air-guarddeny.json` checksum `62179385`, and `synthetic-imported-assertspecial-lifetime.json` checksum `181ded30` gate bounded defender-side `NoStandGuard` / `NoCrouchGuard` / `NoAirGuard` hit-over-guard evidence plus one-frame `NoStandGuard` expiry into later guard.
- Next recommended gate: exact recovery thresholds/velocities beyond the first too-early reject, official KFM negative recovery-window confirmation, broader `AssertSpecial` priority/KFM confirmation/pause layering, or a narrower raw-controller family promotion to required trace evidence.
- Add required traces for controller families currently covered only by unit/runtime tests.
- Previous completed cut: `synthetic-imported-control.json` gates partial static `CtrlSet` typed control evidence and final owner-control telemetry with checksum `80c4c446`; previous `synthetic-imported-kinematic.json` gates partial static `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd` typed kinematic evidence and bounded actor position/velocity telemetry with checksum `92804390`.
- Continue shrinking raw controller fallback paths into typed `ControllerOp` execution.
- Move mutable behavior behind named systems before adding broader parity claims.
- Prefer KFM/Common1 precision when a synthetic gate already exists for the same family.

## Acceptance

- Code has focused tests or a required `pnpm qa:trace` artifact.
- Trace checksum drift is intentional and documented.
- `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/SUPPORTED_FEATURES.md`, `docs/WORKPLAN.md`, and `docs/BUILD_EXECUTION_BACKLOG.md` are updated.
- Claim allowed / claim blocked wording is explicit.

## Blocked Claims

- Full CNS VM parity.
- Full helper/custom-state/redirect/team ownership.
- Full IKEMEN runtime behavior.
- Exact tick order without fixture-backed evidence.
