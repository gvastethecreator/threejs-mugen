# Research: Official stage browser gate

## Question

What browser evidence is sufficient to close the visual gate for the official
MUGEN 1.1b1 Training Room route without committing third-party binary assets or
claiming full stage parity?

## Primary sources

- [Official MUGEN 1.1b1 distribution](https://www.elecbyte.com/mugenfiles/1.1/mugen-1.1b1.zip)
- [Elecbyte 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage/background tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)

The official documentation defines stage layers as ordered background elements
and documents the stage metadata used by the loader. The local external
checkout remains the legal/provenance source; the browser gate creates a
temporary combined ZIP and does not add its binary contents to git.

## Decision

Add `pnpm qa:stage` as a focused Playwright gate. It combines the existing
official KFM fixture with the external `stage0.def`, `stage0.sff`, and
`readme.txt`, uploads that package through `#zip-input`, enters Studio, opens
the Stage surface, selects `stage-training-room`, and captures desktop/mobile
screenshots plus canvas samples.

The gate requires the real bridge to report Training Room with DEF/SFF loaded,
decoded SFF sprites, two rendered background layers, visible Stage Contract and
Layer Diagnostics surfaces, nonblank canvas pixels, no horizontal overflow, and
zero page/console errors. The gate uses a warm Vite base URL because cold
transforms can exceed the browser navigation budget on this workspace.

## Evidence and limits

- Command: `$env:QA_BASE_URL='http://127.0.0.1:5317'; pnpm qa:stage`.
- Diagnostic artifact: `.scratch/qa/official-stage-compatibility-browser/browser-diagnostics.json`.
- Diagnostic SHA-256: `baad6233af2516eab9aed81d0e76cbc1e52f48e05e8556c59326a3e0f3f59938`.
- Generated ZIP: `.scratch/qa/official-stage-compatibility-browser/mugen-official-stage0-browser.zip`.
- Generated ZIP SHA-256: `f6406b0991d1e73e2d87065608b8d13f3b3e5823437452ce2e8f2f150b575972`.
- Desktop canvas: nonblank, 106 sampled colors, 814x733.
- Mobile canvas: nonblank, 213 sampled colors, 390x331.
- Stage report: Training Room, DEF/SFF present, 2 decoded sprites, 2 background layers, 2 rendered/tiled layers, 0 report errors.
- Browser diagnostics: 0 console issues, 0 page errors, 1440/1440 desktop width and 390/390 mobile width.

This closes the browser visual gate only. Native regression, typecheck,
boundary/build closeout for the aggregate journey, exact BGCtrl/window/zoom/
mask/music/motif semantics, commercial redistribution, and full
MUGEN/IKEMEN stage parity remain blocked.
