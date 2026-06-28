# 01 - Runtime Compatibility Gates

Status: ready-for-agent
Labels: runtime-trace, mugen-compat, ready-for-agent

## Objective

Keep converting partial CNS/CMD/runtime behavior into typed operations, named runtime systems, deterministic trace artifacts, and honest compatibility docs.

## Next Useful Cuts

- Next recommended gate: required `ChangeAnim` / `ChangeAnim2` trace for imported animation-source retargeting and active AIR action evidence.
- Add required traces for controller families currently covered only by unit/runtime tests.
- Latest completed cut: `synthetic-imported-control.json` gates partial static `CtrlSet` typed control evidence and final owner-control telemetry with checksum `80c4c446`; previous `synthetic-imported-kinematic.json` gates partial static `VelSet` / `VelAdd` / `VelMul` / `PosSet` / `PosAdd` typed kinematic evidence and bounded actor position/velocity telemetry with checksum `92804390`.
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
