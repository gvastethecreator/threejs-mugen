# TargetDrop RedirectID implementation checkpoint

Date: 2026-07-15

## Status

Implemented as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `090a1477`.

## Delivered behavior

Active CNS and imported State -1 `TargetDrop` controllers now accept the
typed `RedirectID` route under the explicit `ikemen-go` profile. The live root
destination owns target-list and binding pruning while the caller retains the
authored `excludeID` and `keepone` values. Missing RedirectID remains local;
malformed, negative, unavailable, disabled, destroyed, and legacy redirects
fail closed before mutation.

## Focal evidence

- `RuntimeCompiler.test.ts`: typed TargetDrop lowering and invalid expression.
- `StateProgramExecutor.test.ts`: State -1 target side-effect classification.
- `PlayableMatchRuntime.test.ts`: active route, State -1 route, and invalid
  RedirectID route.
- `RuntimeTraceGatePresets.test.ts`: paired required active and State -1
  imported trace artifacts.
- Focal result: 6/6 TargetDrop tests passed.
- `node --check scripts/qa_traces.cjs`: passed.
- `git diff --check`: passed.

The full trace matrix and TypeScript 7 check are intentionally deferred to the
next batched QA checkpoint after another implementation slice. No score,
browser, helper/projectile/team, exact multi-target random, persistence,
rollback/netplay, presentation, or full-parity claim is made here.

## Audit

The implementation was checked across compiler lowering, active dispatch,
State -1 setup classification, root PlayerID resolution, target-memory
binding cleanup, telemetry, required trace registration, and fail-closed
behavior. Existing TargetDrop selection semantics were left unchanged,
including the known random-selection parity gap for multiple equal target IDs.

## Official basis

- [IKEMEN RedirectID state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  supplies the optional PlayerID routing contract and processing-order caveat.
- [Elecbyte TargetDrop documentation](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `excludeID`, `keepone`, and their defaults.

## Next

Research and implement one independent Target* ownership boundary before the
batched QA closeout; TargetBind and TargetState remain separate seams.
