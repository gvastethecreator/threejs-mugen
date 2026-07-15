# TargetLifeAdd state-entry RedirectID v1 research

Date: 2026-07-15

## Question

What is the smallest evidence-backed State -1 slice for IKEMEN
`TargetLifeAdd RedirectID` after the active-CNS route is closed?

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  defines `RedirectID` as an optional state-controller extension that routes
  execution to a designated PlayerID, with ordering caveats.
- [Elecbyte TargetLifeAdd documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines the MUGEN baseline: target id selection, signed life value,
  `absolute`, and `kill` behavior.
- [Pinned IKEMEN system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  provides the engine-side controller entry point used for comparison.
- [Pinned IKEMEN character source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
  shows target mutation operating on the selected actor's remembered target
  collection.

## Findings

1. State -1 setup must run after target memory exists. The fixture seeds both
   target links, waits for the setup gate, and then executes the controller.
2. The caller owns the authored target operation fields and expression context;
   `RedirectID` changes the actor whose target memory is consumed.
3. The existing state-entry dispatch seam can be extended narrowly to
   `TargetLifeAdd`; the target-world mutation path already preserves typed
   `absolute` and `kill` semantics.

## Bounded implementation decision

Entry 552 implements only this contract:

- profile: `ikemen-go`;
- owner class: live root fighters;
- execution path: imported State -1 setup controllers;
- controller family: `TargetLifeAdd`;
- destination: a live root selected by PlayerID;
- target candidate: the destination's remembered target, with the live
  opponent available to the root target world;
- invalid, unavailable, disabled, destroyed, negative, empty, malformed, and
  legacy redirects: fail closed before mutation;
- missing RedirectID: preserve local controller behavior.

The state-program classifier now admits `TargetLifeAdd` alongside the already
closed state-entry `TargetPowerAdd` route. The existing root redirect registry,
target dispatch world, and telemetry remain the ownership boundaries.

## Evidence

The implementation and tests are in:

- `src/mugen/runtime/StateProgramExecutor.ts`;
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`;
- `src/tests/StateProgramExecutor.test.ts`;
- `src/tests/PlayableMatchRuntime.test.ts`;
- `src/tests/RuntimeTraceGatePresets.test.ts`;
- `scripts/qa_traces.cjs`.

The required artifact
`synthetic-imported-target-life-state-entry-redirect` proves the imported
State -1 controller and target operation telemetry, both target links, PlayerID
56 destination lookup, target id 77, and final p1/p2 life values `1000/980`.
Its checksum is `2e4c8c1b` and its final checksum is `27ae97de`.

The global trace gate passes 613/613 artifacts: 579 required, 34 optional,
and 0 skipped. The affected runtime suites pass 867/867 tests, TypeScript 7
typecheck passes, the trace script parses, and `git diff --check` passes.

## Limits and follow-up

Active-state TargetLifeAdd is the preceding bounded entry. Helper and
projectile target memory, neutral identity, team/simul aggregation, other
`Target*` controllers, exact multi-target ordering, persistence,
rollback/netplay, presentation, score movement, and full MUGEN/IKEMEN parity
remain outside this claim. The next slice must be selected as an independent
Target* family boundary with its own source audit and required imported trace.
