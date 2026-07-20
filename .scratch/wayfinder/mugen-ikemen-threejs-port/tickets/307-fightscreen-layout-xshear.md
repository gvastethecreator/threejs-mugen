# T307: Carry FightScreen layout xshear

- Type: task
- Status: resolved at bounded centered-shear scope
- Date: 2026-07-20
- Depends on: T306

## Question

How should the source `AnimLayout.xshear` reach the current top/background
mesh path while preserving the rectangular clip boundary?

## Answer

The system-asset model and loader now carry a finite `xShear` value from the
source `xshear` field. The renderer applies the source sign as a centered
horizontal shear to the pooled plane geometry and recomputes its bounds after
each update, so a reused mesh cannot keep a prior transform.

Entries that combine `xShear` or `angle` with a rectangular `window` are
culled and counted. The current clip path remaps UVs for axis-aligned meshes;
it does not clip the transformed polygon. Diagnostics expose applied and
culled shear counts.

## Evidence

- Focused loader and FightScreen renderer tests: 2 files / 8 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with Vite plus Playwright, Runtime and Studio
  desktop/mobile captures, and no smoke assertion failure.
- Visual review covered Runtime desktop/mobile and Studio authoring/debug
  captures. Main canvases stayed visible and no critical overlap appeared.
- Scoped `git diff --check`: passed.

## Claim ceiling

Allowed: finite top/background `xshear` values applied as centered horizontal
mesh shear without a window, with explicit applied/culled diagnostics.

Blocked: exact source x-offset correction, shear plus window clipping, the
source indexed-palette draw path, `xangle`, `yangle`, projection, focal length,
primary/text transform ownership, KO/winner families, direct imported
FightScreen browser asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
