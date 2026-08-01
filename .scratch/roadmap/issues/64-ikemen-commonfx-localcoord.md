# 64 - T479 Ikemen CommonFX `localcoord` scale projection

Status: closed-bounded
Labels: ikemen, fightfx, renderer, runtime
Lane: runtime / presentation
Priority: P1
Depends on: T478 CommonFX `fx.scale` propagation

## Objective

Apply the CommonFX package coordinate-space factor when a resolved FightFX or
CommonFX animation is presented for a character with a different localcoord.
The authored package scale must remain visible while the runtime draw scale
matches the official coordinate conversion.

## Source contract

Ikemen-GO's CommonFX reference defines `fx.scale` and `localcoord` in the
CommonFX `[Info]` section. Its `char.go` animation path computes the effective
CommonFX scale as `fx.scale * 320 / fx.localcoord.x`, then applies the owning
character's `localcoord.x / 320` ratio. T479 ports that bounded scale formula to
the already resolved hit-spark AIR frame seam.

Sources: [Ikemen-GO Common files / CommonFX](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#common-files-air-cmd-const-fx-states), [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Scope

- Carry CommonFX/FightFX `localcoord` from DEF metadata through imported
  libraries and resolved runtime AIR frames.
- Derive effective hit-spark scale from package and owning-character widths;
  preserve unit/default behavior when metadata is omitted.
- Keep player AIR sparks, fallback geometry, palette, layer, audio, and cache
  behavior unchanged.
- Add focused asset-resolution and importer regressions.

## Acceptance

- Focused CommonFX loader/importer/asset/renderer tests pass.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace`, and `git diff --check` pass.
- No browser smoke is required; the bounded renderer seam is covered by unit
  diagnostics and the runtime trace corpus remains unchanged.

## Claim ceiling

This task does not claim exact CommonFX animation timing, ZSS execution,
`sys.ffx` lifetime/refcount/cache semantics, palette/layer/audio parity,
character custom-state scale transitions, or full Ikemen/M.U.G.E.N FightFX
compatibility.

## Evidence

- `pnpm vitest run src/tests/HitSparkAssetSystem.test.ts src/tests/HitSparkRenderer.test.ts src/tests/MugenSystemAssetsLoader.test.ts src/tests/importedFighter.test.ts`: 4 files / 39 tests passed.
- `pnpm test`: 324 files / 3314 tests passed.
- `pnpm typecheck`: pass (via `pnpm build`).
- `pnpm build`: production Vite bundle generated successfully.
- `pnpm check:boundaries`: pass.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional).
- `git diff --check`: pass; only existing CRLF normalization warnings reported.
