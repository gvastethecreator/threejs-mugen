# Research: Official stage compatibility journey

## Question

What is the smallest legal, reproducible stage/package route that can join the
existing compatibility evidence system without committing third-party binary
assets or claiming more parity than the runtime proves?

## Primary sources

- [Official MUGEN 1.1b1 distribution](https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip)
- [Elecbyte 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage/background tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)

The official distribution readme identifies the sample stages, including
Training Room, as Creative Commons Noncommercial content with optional
attribution. The sample is therefore suitable for an optional-private legal
route when the binary remains external and the readme is retained as license
evidence. This does not grant commercial redistribution rights.

## Decision

Use the local `.scratch/external/mugen-1.1b1` checkout as a reproducible source
fixture. `ExternalStageFixtureManifest/v1` records the source, required files,
license expression, and expected metadata. `StageCompatibilityJourney/v1`
records only references and normalized report/runtime claims; it does not embed
DEF/SFF/readme payloads.

The route loads the real `stage0.def` and `stage0.sff` through
`MugenStageLoader`, checks `StageCompatibilityReport`, runs the playable
`resetBG` round clock, and leaves browser/native states explicit until their
respective gates run.

## Evidence and limits

The local route passes 213 tests across StageJourney, StageReport, StageDefParser,
and PlayableMatchRuntime plus TypeScript 7 typecheck. Its journey status is
`partial` because browser stage render proof and native closeout were not run.
Full BGCtrl semantics, exact animation/camera/window/mask/motif/music behavior,
and full MUGEN/IKEMEN parity remain blocked.
