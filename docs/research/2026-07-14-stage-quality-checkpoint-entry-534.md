# Research: stage quality checkpoint

## Question

Does the accumulated stage work remain safe across the runtime, imported
Training Room route, Studio browser path, and the existing trace corpus?

## Decision

Keep the three BGCtrl slices as bounded compatibility improvements without
moving the score. Accept the checkpoint only after native tests, TypeScript 7,
build, architecture boundaries, CSS budget, trace artifacts, and the official
stage browser route all pass.

## Evidence

- Native suite: 211 files / 2134 tests passed with two workers.
- `pnpm typecheck`: passed.
- `pnpm build`: 289 modules; existing large JavaScript chunk advisory remains.
- `pnpm check:boundaries`: passed.
- `pnpm qa:css:budget`: passed at 324085/536051 bytes, 1519/2364 rules,
  zero duplicate selector keys, and zero shadowed rules.
- `pnpm qa:trace`: 600/600 artifacts passed, 566 required and 34 optional;
  89 controller families, 84 operation families, and no skipped optional
  fixtures.
- `pnpm qa:stage`: official Training Room passed in desktop/mobile browser
  views with 2 decoded sprites, 2 rendered/tiled layers, nonblank canvases,
  no horizontal overflow, and zero console/page errors.

The first trace invocation reached the five-minute command limit without a
failure result. A rerun with a fifteen-minute window completed in 294.5s and
passed all artifacts; this is recorded as an operational timeout, not a
compatibility failure.

## Claim ceiling

The checkpoint validates the current bounded stage slices and preserves the
previous score band. It does not claim exact BGCtrl multi-group state, full
stage zoom/window/mask/parallax semantics, or complete MUGEN/IKEMEN parity.
