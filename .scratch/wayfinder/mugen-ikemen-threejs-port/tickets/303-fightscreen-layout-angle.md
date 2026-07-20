# T303: Rotate FightScreen layout sprites

- Type: task
- Status: resolved at bounded centered Z-rotation scope
- Date: 2026-07-20
- Depends on: T302

## Question

How should the authored FightScreen `AnimLayout.angle` reach the current
Three.js renderer without claiming support for the other layout transforms?

## Answer

The system-asset model and loader now carry a finite `angle` value in degrees.
The renderer applies it as a centered `mesh.rotation.z` for top/background
layout sprites. Entries that combine `angle` with `window` are culled and
reported because the current mesh path cannot keep a rotated polygon clip
while preserving the existing UV remap contract.

Diagnostics expose `angleApplied` and `angleCulled`, so the unsupported mixed
case stays visible in runtime evidence. Entries without an angle reset to zero
on every render and keep the existing placement and blend behavior.

## Evidence

- Focused loader, renderer, and projection tests: 3 files / 21 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 322 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with Vite plus Playwright, desktop/mobile runtime
  captures, Studio authoring/debug captures, and no smoke assertion failure.
- Visual review covered runtime desktop/mobile and Studio authoring/debug
  captures. The main canvas stayed visible and no critical overlap appeared.
- `git diff --check`: passed; existing roadmap CRLF warnings remain unrelated.

## Claim ceiling

Allowed: centered Z rotation for top/background FightScreen layout sprites
without a window, with explicit diagnostics for the mixed unsupported case.

Blocked: `xangle`, `yangle`, shear, projection, focal length, exact rotated
window clipping, tile, PalFX, primary `AnimTextSnd` composition, KO/winner
families, direct imported FightScreen browser asset proof, and full
MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
