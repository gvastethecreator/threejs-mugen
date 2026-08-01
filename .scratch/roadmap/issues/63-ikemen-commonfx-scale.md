# 63 - T478 Ikemen CommonFX `fx.scale` propagation

Status: closed-bounded
Labels: ikemen, fightfx, renderer, runtime
Lane: runtime / presentation
Priority: P1
Depends on: T477 signed `fall.xvelocity` bounce

## Objective

Honor the Ikemen-GO CommonFX `[Info] fx.scale` value for package-backed
FightFX/CommonFX hit-spark sprites. The authored scale must survive DEF load,
imported-fighter normalization, hit-effect frame selection, and the Three.js
sprite mesh without changing the default scale when the field is omitted.

## Source contract

Ikemen's official CommonFX reference defines graphic/sound effect packs in a
DEF with `prefix`, `fx.scale`, and `localcoord`; prefixed animation/sound refs
select the package. This slice implements only the positive `fx.scale` visual
factor. `localcoord`, ZSS CommonFX sources, `sys.ffx` lifetime/refcount/cache,
audio arbitration, and exact presentation parity remain separate work.

Source: [Ikemen-GO Common files / CommonFX](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#common-files-air-cmd-const-fx-states)

## Scope

- Parse positive `fx.scale` and positive `localcoord` metadata from prefixed
  FightFX/CommonFX DEF `[Info]` sections.
- Preserve `fx.scale` through `MugenSystemHitSparkLibrary`, imported fighter
  libraries, and each resolved runtime AIR frame.
- Apply the bounded scale to resolved hit-spark sprite dimensions and AIR/SFF
  axis offsets; omitted/invalid/`1` values keep the existing behavior.
- Add focused loader, importer, asset-resolution, and renderer regressions.

## Acceptance

- Focused CommonFX loader/importer/asset/renderer tests pass.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- No visual browser smoke is required for this metadata-only renderer seam;
  runtime renderer unit evidence is recorded instead.

## Claim ceiling

This task does not claim CommonFX `localcoord` projection, ZSS CommonFX
execution, `sys.ffx` cache/refcount lifetime, audio channel fallback, palette
or layer parity, or full Ikemen/M.U.G.E.N FightFX compatibility.

## Evidence

- `pnpm vitest run src/tests/HitSparkAssetSystem.test.ts src/tests/HitSparkRenderer.test.ts src/tests/MugenSystemAssetsLoader.test.ts src/tests/importedFighter.test.ts`: 4 files / 38 tests passed.
- `pnpm test`: 324 files / 3313 tests passed.
- `pnpm typecheck`: pass (via `pnpm build`).
- `pnpm build`: production Vite bundle generated successfully.
- `pnpm check:boundaries`: pass.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional).
- `git diff --check`: pass; only existing CRLF normalization warnings reported.
