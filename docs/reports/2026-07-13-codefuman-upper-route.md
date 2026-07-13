# Code Fu Man Upper Route Report

Date: 2026-07-13
Status: closed at bounded optional-fixture scope

## Question

Can a second authored Code Fu Man command route prove an upper attack through
the same production loader, deterministic trace, and real browser input while
remaining independent from the normal `x` and QCF routes?

## Source and authored route

- Source: [Jesuszilla/CodeFuMan](https://github.com/Jesuszilla/CodeFuMan).
- Permission and archive provenance are inherited from the audited local MIT
  package recorded in `ExternalFixtureManifest/v1`.
- Command: `kfm.cmd` defines `upper_x` as `~F, D, DF, x`.
- State route: the authored State -1 entry `Light Kung Fu Upper` changes to
  state `1100` when `command = "upper_x"` and the package combo condition is
  active.
- State behavior: `kfm.cns` state `1100` publishes AIR action `1100`, applies
  authored `Width` controllers during the action, and executes two authored
  `HitDef` branches at the initial and later animation timing points.

## Implementation

- `createImportedUpperXTraceArtifact` adds a distinct state/command gate for
  `upper_x`, requiring state `1100`, `Width`, `collision:width`, `HitDef`, and
  a bounded hit event.
- `createCodeFuManIndependentUpperXTraceArtifact` binds that gate to the
  independently sourced Code Fu Man package.
- `CodeFuManFixture.test.ts` proves the route cannot pass from the normal `x`
  or QCF artifacts.
- `qa_traces.cjs` registers the optional artifact.
- `qa_smoke.cjs` sends physical `F -> D -> DF -> x`, pauses on state `1100`,
  captures the Three.js canvas, and requires idle recovery.

## Evidence

### Deterministic trace

Artifact: `codefuman-independent-upper-x`
Target: `codefuman-independent-upper-x-golden`
Status: passed
Checksum: `f26de55f`
Initial checksum: `3bb8fbdd`
Final checksum: `392e1dbb`
Frames: `31`

The gate observed routed/executed state `1100`, active commands `upper_x` and
`x`, `ChangeState: 1`, `Width: 9`, `HitDef: 2`,
`collision:width: 9`, `hitdef: 2`, and a bounded contact event.

### Browser smoke

The real local ZIP upload and keyboard adapter reached imported state/action
`1100/1100`. The captured sprite was `37 x 104` with axis `14,103`; the full
canvas had `1005` unique colors and the projected sprite had `1412` unique
colors. The browser gate passed nonblank output and idle return.

### Batch closure

- Focused Code Fu Man suite: `5/5` passed.
- Full tests: `185` files, `1964` tests passed.
- `pnpm typecheck`: passed.
- `pnpm check:boundaries`: passed.
- `pnpm build`: passed with the existing `1,662.07 kB` chunk advisory.
- `pnpm qa:trace`: `581/581` artifacts passed (`547` required, `34` optional).
- `pnpm qa:smoke`: passed across runtime, imported visual, Tag, and Studio
  surfaces.

## Claim ceiling

Allowed: two independent authored Code Fu Man routes are now evidenced, with
this slice specifically covering `upper_x -> 1100 -> AIR 1100`, Width telemetry,
HitDef execution, browser pixels, and idle recovery.

Blocked: every other Code Fu Man special, complete AIR/Width semantics, exact
command priority/buffering, full Common1 timing, broad CNS/controller parity,
public asset bundling, commercial corpus support, exact visual/audio/AI parity,
and full MUGEN/IKEMEN compatibility.
