# Code Fu Man QCF Special Route Report

Date: 2026-07-13
Status: closed at bounded optional-fixture scope

## Question

Can the independent Code Fu Man package prove one authored quarter-circle
forward special through the production loader, deterministic runtime trace, and
real browser input without being mistaken for broad command or MUGEN parity?

## Source and authored route

- Source: [Jesuszilla/CodeFuMan](https://github.com/Jesuszilla/CodeFuMan).
- Permission: MIT, preserved at `chars/cfm/LICENSE` in the local package.
- Archive: `.scratch/fixtures/codefuman.zip`, 307511 bytes, SHA-256
  `7974f5101a3f3bca0ef3aef3b491fc34d81cbc132d91b53a51b78f34819b1ca0`.
- Command: `kfm.cmd` defines `QCF_x` as `~D, DF, F, x`.
- State route: the authored State -1 entry `Light Kung Fu Palm` changes to
  state `1000` when `command = "QCF_x"` and the package combo condition is
  active.
- State behavior: `kfm.cns` state `1000` changes to AIR action `1000`, applies
  authored `PosAdd` controllers, and executes the near/far `HitDef` branch at
  animation element `5`. `data/common1.cns` remains part of the imported
  package route.

## Implementation

- `createCodeFuManIndependentQcfXTraceArtifact` wraps the existing imported QCF
  trace harness with an independent target id, required `ChangeState`, `PosAdd`,
  and `HitDef` evidence, typed `kinematic:posadd` / `hitdef` operations, and a
  required hit event.
- `CodeFuManFixture.test.ts` proves provenance, production ZIP loading, the
  prior normal `x` route, and this special route independently.
- `qa_traces.cjs` registers the optional artifact without making the local
  third-party fixture a required repository asset.
- `qa_smoke.cjs` sends physical `D -> DF -> F -> x` input, pauses on state
  `1000`, captures the Three.js canvas, and requires return to idle.

## Evidence

### Deterministic trace

Artifact: `codefuman-independent-qcf-x`
Target: `codefuman-independent-qcf-x-golden`
Status: passed
Checksum: `5540d52b`
Initial checksum: `3bb8fbdd`
Final checksum: `f1dac6db`
Frames: `31`

The gate observed routed/executed state `1000`, `ChangeState: 1`,
`HitDef: 1`, `PosAdd: 3`, `kinematic:posadd: 3`, `hitdef: 1`, active commands
`QCF_x` and `x`, and a bounded contact event.

### Browser smoke

The optional ZIP was uploaded through the real file input and rendered by the
Three.js runtime. The captured special frame was imported state `1000`, AIR
action `1000`, sprite `74 x 95`, axis `39,94`, canvas `1002` unique colors,
and projected sprite `3245` unique colors. The browser gate passed the special
return to idle and reported no page errors.

### Batch closure

- Focused fixture suite: `4/4` passed.
- `pnpm qa:trace`: `580/580` artifacts passed (`547` required, `33` optional).
- `pnpm qa:smoke`: passed across runtime, imported visual, Tag, and Studio
  surfaces.

Full test, typecheck, boundary, and production-build closure remains part of
the next batched quality round after the next implementation slice.

## Claim ceiling

Allowed: one independently sourced Code Fu Man `QCF_x -> 1000 -> AIR 1000`
route through bounded loader, trace, and browser evidence.

Blocked: every other Code Fu Man special, exact command priority/buffering,
full Common1 timing, broad CNS/controller parity, public asset bundling,
commercial corpus support, exact visual/audio/AI parity, and full
MUGEN/IKEMEN compatibility.
