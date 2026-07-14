# Report: Official stage browser gate

## Result

Entry 528 closes the official Training Room browser gate with a focused,
reproducible Playwright route. The stage is imported through the production ZIP
input, selected in Studio Stage, rendered through Three.js, and inspected at
desktop and mobile sizes. The aggregate `StageCompatibilityJourney/v1` remains
`partial` until native closeout is run.

## Verified route

- Generated a temporary 412,304-byte package from `kfm-official.zip` plus the
  external official `stage0.def`, `stage0.sff`, and `readme.txt`.
- Imported the package through `#zip-input` and exposed two imported stage
  reports, selecting `stage-training-room` in Studio.
- Training Room report: DEF/SFF present, 2 decoded sprites, 2 background
  layers, 2 rendered/tiled layers, 0 report errors.
- Desktop canvas: nonblank, 106 sampled colors, 814x733; no horizontal overflow.
- Mobile canvas: nonblank, 213 sampled colors, 390x331; no horizontal overflow.
- Studio Stage Contract, Stage Preview, Available Stages, BG Layer Status, and
  Layer Diagnostics were present.
- Browser diagnostics recorded 0 console issues and 0 page errors.

## Verification

- `node --check scripts/qa_stage_compatibility.cjs`: passed.
- `git diff --check -- package.json scripts/qa_stage_compatibility.cjs`: passed.
- `$env:QA_BASE_URL='http://127.0.0.1:5317'; pnpm qa:stage`: passed.
- Visual inspection passed for the desktop and mobile PNG artifacts under
  `.scratch/qa/official-stage-compatibility-browser/`.

## Claim ceiling

Allowed: browser-backed import, Studio selection, report, and bounded Three.js
render proof for the official noncommercial Training Room sample. Still
blocked: native regression/build/boundary aggregate closeout, exact
MUGEN/IKEMEN stage parity, full BGCtrl/window/zoom/mask/music/motif behavior,
commercial redistribution, and required corpus promotion.
