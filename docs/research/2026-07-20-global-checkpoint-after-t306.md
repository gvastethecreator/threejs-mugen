# Global checkpoint after T306

Date: 2026-07-20
Implementation HEAD: `dc15736b`

## Result

The grouped checkpoint after the FightScreen layout and `AnimTextSnd` PalFX
slices is green. Compatibility scores stay unchanged. This report records
repository health and the evidence envelope; it does not widen the port claim.

## Gates

- `pnpm test`: 237 files / 2518 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:css:budget`: passed within all configured budgets.
- `pnpm qa:assets:hygiene`: passed with zero violations.
- `pnpm qa:smoke`: passed with Vite plus Playwright and the current Runtime and
  Studio desktop/mobile capture matrix.
- Visual review covered Runtime desktop/mobile, Studio authoring, and Studio
  debug captures. Main canvases stayed visible with no critical overlap.

## Current implementation envelope

- FightScreen timing, skip, reset, AIR/FNT/SFF presentation, FNT palette banks,
  top/background layouts, rectangular windows, valid layer values, centered
  angle, bounded layout PalFX, primary AIR PalFX, and bitmap FSText PalFX are
  closed only at the slices documented by T282-T306.
- The shared material helper keeps the actor and FightScreen bounded palette
  behavior aligned, while exact indexed-palette shader math remains open.
- The browser smoke fixture still lacks a direct imported FightScreen
  screenpack asset. Browser asset parity remains unproven.

## Residual risks

- The production bundle remains above the configured chunk warning threshold.
- The working tree still contains pre-existing roadmap edits and research
  files outside this checkpoint. They were not staged or changed by this
  closeout.
- `sin*` PalFX fields, hue, invertblend, interpolation, effect composition,
  advanced layout transforms, primary text ownership beyond bitmap glyphs,
  KO/winner families, full draw interleaving, rollback/netplay, ZSS/Lua/
  Modules, broad asset corpus coverage, and a releaseable imported project
  remain open.
- Full MUGEN/IKEMEN parity remains open.
