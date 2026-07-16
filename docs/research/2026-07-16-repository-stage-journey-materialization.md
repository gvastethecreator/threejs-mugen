# Research: repository stage journey materialization

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 220

## Question

What is the smallest honest aggregate for the Skyline Relay stage after the
production runtime and visible browser routes pass independently?

## Decision

Materialize two linked artifacts from one package digest. Keep the runtime
snapshots in a dedicated schema, embed only normalized references in the
compatibility journey, validate the serialized journey with its production
parser, and preserve `nativeRegression.status = not-run`. A browser pass must
not imply native or snapshot readiness.

## Implementation findings

- `RepositoryStageRuntimeArtifact/v1` records initial, first-frame, terminal
  time-over, and next-round snapshots, including the `resetBG = 0` clock result.
- `StageCompatibilityJourney/v1` remains `partial` when native fields are
  `not-run`, even if loader, runtime, and browser evidence pass.
- The package digest remains the join key across VFS, runtime, browser, and
  future native evidence.
- ZIP generators now disable JSZip implicit folder creation so fixed DOS entry
  metadata actually produces repeatable bytes; extracted VFS identity remains
  the application transport contract.

## Evidence design

- Browser QA runs first and writes diagnostics plus desktop/mobile artifacts.
- The materializer consumes that browser output, regenerates production runtime
  evidence, writes both JSON artifacts, and parses the journey from disk.
- The checksum is recorded in the closeout so a later snapshot decision can
  detect drift instead of trusting file presence.

## Claim boundary

Allowed: parser-valid, machine-readable Skyline Relay aggregation covering
production loader/runtime and real browser ZIP/folder evidence.

Blocked: native build/regression evidence, compatibility snapshot promotion,
score movement, arbitrary package compatibility, and complete MUGEN/IKEMEN
stage parity.
