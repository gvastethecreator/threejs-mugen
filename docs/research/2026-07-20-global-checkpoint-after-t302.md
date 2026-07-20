# Global checkpoint after T302

Date: 2026-07-20
Implementation HEAD: `7c6da75e`

## Result

The grouped checkpoint after the FightScreen layout window and layer-order
slices is green. The compatibility scores stay unchanged. This report records
repository health and the evidence envelope; it does not widen the port claim.

## Gates

- `pnpm test`: 237 files / 2516 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 322 transformed modules. The known large-chunk
  warning remains.
- `pnpm qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:css:budget`: passed within all configured budgets.
- `pnpm qa:assets:hygiene`: passed with zero violations.
- `pnpm qa:smoke`: passed with Vite plus Playwright and the current runtime and
  Studio capture matrix.

## Current implementation envelope

- FightScreen timing, skip, reset, AIR/FNT/SFF presentation, FNT palette banks,
  top/background layouts, rectangular layout windows, and valid layout layer
  values are closed only at the bounded slices documented by T282-T302.
- T301 and T302 smoke fixtures do not contain a direct imported FightScreen
  screenpack asset. Browser asset parity remains unproven.
- The next renderer work must preserve the source-backed boundary around
  primary composition, advanced transforms, PalFX, KO/winner families, and
  exact cross-system draw interleaving.

## Residual risks

- The production bundle remains above the configured chunk warning threshold.
- The working tree still contains pre-existing roadmap edits and research
  files outside this checkpoint. They were not staged or changed by this
  closeout.
- Full MUGEN/IKEMEN parity, rollback/netplay, ZSS/Lua/Modules, broad asset
  corpus coverage, and a releaseable imported project remain open.
