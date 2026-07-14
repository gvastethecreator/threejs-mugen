# Official stage browser gate

## Status

Resolved as Entry 528. The browser portion of the official stage journey is
passed; the aggregate journey remains partial until native closeout.

## Evidence

- `scripts/qa_stage_compatibility.cjs` creates a temporary legal external-stage
  package, imports it through the real file input, and navigates the actual
  Studio Stage surface.
- Desktop and mobile screenshots/canvas samples prove Training Room is not
  blank, has two rendered/tiled layers, has no horizontal overflow, and emits
  no page or console errors.
- The temporary diagnostic payload is checksum-addressed at
  `.scratch/qa/official-stage-compatibility-browser/browser-diagnostics.json`.

## Claim boundary

Allowed: official noncommercial sample stage browser import, Studio report, and
bounded Three.js rendering. Blocked: native regression/build/boundary closeout,
exact BGCtrl/window/zoom/mask/music/motif semantics, commercial redistribution,
and full MUGEN/IKEMEN stage parity.

## Next

Run the broad native closeout once the current implementation batch is ready,
then promote this route into `CompatibilityCorpus/v0` as `optional-private`
without committing the external binary package.
