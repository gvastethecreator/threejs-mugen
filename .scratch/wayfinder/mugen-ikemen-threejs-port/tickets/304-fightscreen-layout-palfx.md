# T304: Carry FightScreen layout PalFX

- Type: task
- Status: resolved at bounded material-effect scope
- Date: 2026-07-20
- Depends on: T303

## Question

Which source `AnimLayout.palfx` fields can the existing Three.js
top/background path carry while keeping exact palette math as a separate
compatibility boundary?

## Answer

The system-asset model and loader now carry `palfx.time`, `add`, `mul`,
`color`, and `invertall`. The renderer resolves the effect against the current
FightScreen announcement frame tick, applies it to the layout material, and
reports active or expired effects. Positive finite times remain active for
their source-sized frame window; negative or missing time keeps the bounded
effect active, while explicit zero disables it.

The material calculation now lives in a shared utility used by characters and
FightScreen layouts, preserving the existing character behavior. Layout blend
selection remains authored after the effect so T300 additive/alpha ordering is
stable. The adapter remains an approximation of the source shader and palette
pipeline.

## Evidence

- Focused loader, FightScreen renderer, and CharacterRenderer tests: 3 files /
  11 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- First `pnpm qa:smoke` attempt timed out while reopening the saved Studio
  project in the harness; the partial Workbench capture was present and showed
  a live canvas. A second run passed with `status: passed`.
- Visual review covered the second-run Runtime desktop/mobile, Studio
  authoring, and Studio debug captures. The main canvases stayed visible and
  no critical overlap appeared.
- Scoped `git diff --check`: passed.

## Claim ceiling

Allowed: loading and applying the bounded `time`, `add`, `mul`, `color`, and
`invertall` fields to top/background layout materials, with frame-clock expiry
diagnostics and shared actor/material behavior.

Blocked: exact indexed-palette/shader math, negative color arithmetic,
`sinadd`, `sinmul`, `sincolor`, `sinhue`, `hue`, `invertblend`, interpolation,
effect composition, primary `AnimTextSnd` text PalFX, KO/winner families,
direct imported FightScreen browser asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/image.go
