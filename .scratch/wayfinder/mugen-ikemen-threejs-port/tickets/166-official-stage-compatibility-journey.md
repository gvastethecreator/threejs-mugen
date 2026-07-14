# Official stage compatibility journey

## Status

Implemented as a partial, evidence-gated route in Entry 527.

## Source and legal boundary

The route uses the official MUGEN 1.1b1 sample Training Room stage. The
distribution readme identifies the sample stages as Creative Commons
Noncommercial content with optional attribution. This is an optional-private
legal route, not a claim of commercial redistribution permission.

- [Official MUGEN 1.1b1 distribution](https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip)
- [Elecbyte 1.1b1 background docs](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)

## Implemented

- `ExternalStageFixtureManifest/v1` records source URL, SPDX license
  expression, local external directory, required DEF/SFF/readme files, and
  expected stage metadata.
- `StageCompatibilityJourney/v1` normalizes and freezes package, loader,
  stage-report, runtime, browser, native-regression, and claim evidence.
- Direct parsing validates checksum, status, and diagnostics without copying
  serialized payloads into another input envelope.
- The official local fixture loads through `MugenStageLoader`, reports decoded
  SFF and ordered/tiled background coverage, and proves `resetBG` at round 2.

## Evidence

- `StageCompatibilityJourney.test.ts`, `StageCompatibilityReport.test.ts`,
  `StageDefParser.test.ts`, and `PlayableMatchRuntime.test.ts`: 213 tests pass.
- `pnpm exec tsc -p tsconfig.json --noEmit`: pass.
- The journey is intentionally `partial`: browser stage smoke and native
  closeout are not yet run. No binary fixture is committed.

## Claim ceiling

Allowed: production loading and bounded runtime/report evidence for this
official noncommercial stage package. Blocked: browser render proof, exact
MUGEN/IKEMEN stage parity, commercial redistribution, full BGCtrl semantics,
motif/music parity, and corpus promotion as required-legal evidence.
