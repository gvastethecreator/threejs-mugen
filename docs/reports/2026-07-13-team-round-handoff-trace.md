# Progress Report - TeamRoundHandoff Trace/v0

Date: 2026-07-13
Area: IKEMEN bounded runtime / required team-round evidence
Status: implementation complete; aggregate trace gate green

## Delivered

- Added the required `synthetic-imported-team-round-handoff` trace to
  `pnpm qa:trace`.
- The trace uses the public `MatchWorld` boundary with `runtimeProfile:
  "ikemen-go"`, `teamMode: "turns"`, two active roots, and two reserves.
- A lethal imported `HitDef` first leaves the defeated member observable as
  KO/active; the following sampled tick applies the typed handoff and proves
  outgoing `p2` standby/over-KO plus incoming `p4` active state.
- Runtime logs expose the ordered decision, preflight, commit, and completion
  phases for artifact evidence.

## Verification

- Focused preset test: 1 test passed.
- `pnpm qa:trace`: `582/582` artifacts passed, `548` required and `34`
  optional; new artifact checksum `150f1d03`.
- Existing artifact checksums remain stable in the aggregate output.
- No `qa:smoke` run: renderer, CSS, Studio, sprite, and visible snapshot
  surfaces are unchanged.

## Quality audit

The first focal run exposed an evidence bug: applying the handoff in the same
runner step erased the pre-handoff KO frame. The trace adapter now deliberately
holds the KO frame for one sample, then applies the public transaction on the
next tick. This keeps evidence honest without changing production round
scheduling. No independent reviewer was available; closure relies on the
source contract, focused preset, and aggregate gates.

## Claim boundary

Allowed: required aggregate evidence for a real lethal contact followed by
typed Turns handoff and active/reserve team-state transitions.

Blocked: automatic KO-to-handoff scheduling, slot/reference remapping,
life/resource reset, round continue flow, P1/P2 ownership transfer, lifebars,
win poses, rollback, netplay, and full MUGEN/IKEMEN parity.
