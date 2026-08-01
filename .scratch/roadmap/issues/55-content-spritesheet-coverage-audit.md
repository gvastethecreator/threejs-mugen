# 55 - T470 content spritesheet coverage audit

Status: closed-bounded
Labels: generated-assets, spritesheet-expert, visual-qa, roadmap
Lane: content / generated assets
Priority: P1
Depends on: T461 roster v2 regeneration, T462 parallax stage packs

## Objective

Make the spritesheet verification surface enumerate every character package,
not only the eight v2 regeneration runs. The report must distinguish complete
atlases from identity-anchor-only packages and expose source-grid reuse before
an atlas can be promoted.

## Scope

- Run `spritesheet-expert/scripts/validate_run.py --stage pre-package` for the
  eight v2 production runs.
- Record per-run source-grid coverage from `regeneration-map.json`, including
  incomplete rows and duplicated provider cells.
- Inventory every directory under `public/characters`, including the three
  older packaged sheets and six identity-anchor-only packages.
- Keep the aggregate red whenever animation, identity, provenance, runtime
  preview, or visual-review gates are red; this audit does not waive any gate.

## Acceptance

- `pnpm qa:content:spritesheets` writes a versioned report with production-run
  results, source-coverage rows, and the complete public-character inventory.
- All eight v2 runs are checked individually and retain their current exact
  gate statuses and input fingerprints.
- Identity anchors are reported as pending action rows rather than silently
  counted as complete sheets.
- Existing failing evidence remains visible; no procedural or placeholder art
  is promoted to resolve the report.

## Final evidence (2026-08-01)

- Four stage packs still pass their independent parallax validator and browser
  gate; this task only extends the spritesheet ledger.
- The report now covers 17 public character directories: 11 atlas-bearing
  packages and 6 identity-anchor-only packages.
- The eight v2 runs pass provenance, frame alignment, and runtime playback, but
  remain blocked by animation contracts, identity consistency, and independent
  visual review. Source coverage records repeated action-grid cells for the
  walk/guard/special rows instead of hiding those duplicates.

## Claim ceiling

This task proves coverage and honest gate reporting only. It does not promote
the eight atlases, complete the six identity-only packages, or claim M.U.G.E.N/
Ikemen compatibility or visual-art approval.
