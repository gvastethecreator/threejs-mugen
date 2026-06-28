# 01 - Runtime Compatibility Gates

Status: ready-for-agent
Labels: runtime-trace, mugen-compat, ready-for-agent

## Objective

Keep converting partial CNS/CMD/runtime behavior into typed operations, named runtime systems, deterministic trace artifacts, and honest compatibility docs.

## Next Useful Cuts

- Add required traces for controller families currently covered only by unit/runtime tests.
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
