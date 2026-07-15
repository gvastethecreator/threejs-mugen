# TargetPowerAdd state-entry RedirectID v1 research

Date: 2026-07-15

## Question

What is the smallest evidence-backed state-entry slice for IKEMEN
TargetPowerAdd RedirectID after the active CNS route is closed?

## Official source basis

- [IKEMEN state-controller RedirectID documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
  identifies RedirectID as an IKEMEN extension that redirects controller
  ownership to a player identity.
- [Pinned IKEMEN system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
  provides the engine-side target-power controller entry point used for the
  compatibility comparison.
- [Pinned IKEMEN character source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
  shows target-power mutation operating on the selected actor's remembered
  target collection.
- [Elecbyte state-controller documentation](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
  defines the MUGEN TargetPowerAdd baseline as a power mutation applied to
  selected targets, optionally filtered by target id.

## Findings

1. State-entry setup is evaluated at the input/state-entry boundary. A trace
   must first create target memory, then open a later controlled state entry;
   evaluating the controller on the first frame would correctly fail closed
   because no target exists yet.
2. Multiple `trigger1` lines are alternatives in CNS. The bounded fixture
   uses `triggerall` for the target-memory, stage-time, and one-shot guards.
3. RedirectID changes the actor whose target memory is selected. The amount
   and RedirectID expression remain evaluated from the original caller.

## Bounded implementation decision

Entry 550 implements only this contract:

- profile: `ikemen-go`;
- owner class: live root fighters;
- execution path: imported State -1 setup controllers;
- controller family: `TargetPowerAdd`;
- destination: a live root selected by PlayerID;
- target candidate: the destination's remembered target, with the live
  opponent available to the root target world;
- invalid, unavailable, disabled, destroyed, negative, empty, and legacy
  redirects: fail closed before mutation;
- missing RedirectID: preserve local controller behavior.

The runtime keeps the existing root redirect registry and target dispatch
world. State-program classification admits only TargetPowerAdd from the target
side-effect family into setup dispatch; other target side effects remain
outside this entry.

## Evidence

The implementation and tests are in:

- `src/mugen/runtime/StateProgramExecutor.ts`;
- `src/mugen/runtime/PlayableMatchRuntime.ts`;
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`;
- `src/tests/StateProgramExecutor.test.ts`;
- `src/tests/PlayableMatchRuntime.test.ts`;
- `src/tests/RuntimeTraceGatePresets.test.ts`;
- `scripts/qa_traces.cjs`.

The required artifact
`synthetic-imported-target-power-state-entry-redirect` proves the imported
state-entry controller and target operation telemetry, both target links,
PlayerID 56 destination lookup, target id 77, and final p1/p2 power values
35/110. Its checksum is `e531fcdc`.

The global trace gate passes 611/611 artifacts: 577 required, 34 optional,
and 0 skipped. The affected runtime suites pass 814/814 tests, TypeScript 7
typecheck passes, the trace script parses, and `git diff --check` passes.

## Limits and follow-up

Active-state TargetPowerAdd is the preceding bounded entry. Helper and
projectile target memory, neutral identity, team/simul aggregation, other
Target* controllers, persistence, rollback/netplay, presentation, score
movement, and full MUGEN/IKEMEN parity remain outside this claim. The next
slice must be selected as an independent target-family boundary with its own
source audit and required imported trace.
