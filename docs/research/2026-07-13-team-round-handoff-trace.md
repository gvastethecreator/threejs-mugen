# Research - TeamRoundHandoff Trace/v0

Date: 2026-07-13
Status: source-backed evidence cut

## Question

What trace is sufficient to close the missing `046g` acceptance evidence for
KO and replacement ordering without claiming that the pair-owned round system
already performs full Turns continuation?

## Primary evidence

- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  treats `TeamMode` as explicit match context and distinguishes `turns` from
  other team modes.
- [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  requires `RoundNotOver` to be asserted during a win pose, so a trace must
  preserve the round decision boundary rather than infer continuation from a
  stale flag.
- [Pinned Ikemen-GO system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
  separates round-end decision from later Turns activation, which supports
  recording the KO frame before observing a replacement mutation.

## Decision

The required trace uses a real `MatchWorld` with explicit IKEMEN Turns roots.
It samples the lethal KO frame first, then invokes the already-typed public
handoff boundary on the next trace step. The gate requires:

1. imported hit and round evidence;
2. ordered handoff phase logs;
3. p2 life `0` before standby promotion;
4. p2 standby/over-KO and p4 reserve-to-active frame transitions;
5. p2 still present in the final pair snapshot and p4 in the reserve snapshot.

The one-tick adapter is trace orchestration only. It does not silently promote
production `RuntimeRoundSystem` into automatic continuation ownership.

## Local evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts` creates the real four-root
  synthetic imported scenario.
- `src/mugen/runtime/PlayableMatchRuntime.ts` records ordered transaction
  phases in the existing runtime log stream.
- `scripts/qa_traces.cjs` registers the artifact as required.
- `src/tests/RuntimeTraceGatePresets.test.ts` covers the artifact contract.
- `pnpm qa:trace` passes `582/582` artifacts (`548` required, `34` optional),
  with checksum `150f1d03` for the new trace.

## Claim boundary

Allowed: source-backed required evidence for lethal KO followed by typed Turns
handoff ordering at the public runtime boundary.

Blocked: automatic scheduling, slot/reference remapping, life/resource reset,
round restart/continue, lifebars, win poses, rollback/netplay, and full parity.
