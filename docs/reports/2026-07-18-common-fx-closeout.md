# Common.Fx Closeout Report

- Date: 2026-07-18
- Scope: T255 ordered `[Common] Fx*` FightFX package loading
- Implementation commit: `750e888e`
- Planning commit: `0ac95dca`
- ADR: [`docs/adr/0022-common-fx-packages.md`](../adr/0022-common-fx-packages.md)
- Research: [`docs/research/2026-07-18-common-fx-packages.md`](../research/2026-07-18-common-fx-packages.md)

## Result

`MugenSystemAssetsLoader` now reads `Fx` and `Fx<number>` entries from the
game's `[Common]` section in natural order. Root-style and config-relative
references are resolved through the existing virtual path boundary. Supported
FightFX DEF packages are loaded before character FX packages, their paths are
recorded in `commonFightFxPaths`, and normalized prefixes use deterministic
first-valid ownership. Missing, ZSS, wrong-format, and duplicate-prefix cases
remain visible through diagnostics.

The implementation reuses the existing `fightFxLibraries` contract and the
imported-fighter prefix lookup. It does not create a second hit-spark asset
model or change renderer ownership.

## Source basis

The decision is based on the official [IKEMEN GO common files reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
and the pinned local IKEMEN source at commit `044da72008b8ba13caf7b0f820526ce16e955fb3`.
The upstream source loops sorted common FX entries and loads them as
non-character FightFX; the local bounded contract preserves that ordering and
common-before-character ownership while making collision behavior explicit.

## Verification

- Focused system-assets/imported-fighter run: `2` files, `15/15` tests passed.
- Full suite: `230/230` files, `2380/2380` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; the existing Vite large JavaScript chunk warning
  remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `pnpm qa:trace`: passed with `633/633` artifacts (`599` required,
  `34` optional), `92` controller families, and `87` operation families.
- `git diff --cached --check`: passed for the staged closeout patch.

## Browser residual

The isolated command
`QA_SMOKE_OUT_DIR=.scratch/qa/qa-smoke-t255 pnpm qa:smoke` ran for `424.1s`
and timed out before the harness wrote `diagnostics.json`. It produced partial
captures through `studio-debug-inspector-jump-mobile.png`, with no assertion
summary available. The existing full smoke output is not reused as a T255
pass, so this report makes no browser-pass claim. The trace runner also logs
that WebSocket port `24678` is occupied by an unrelated existing Node/Vite
process; trace assertions still passed.

## Audit and claim

The slice is closed at the loader boundary: tests cover ordering,
config-relative resolution, common-only packages, common-before-character
prefix ownership, missing references, ZSS rejection, wrong-format rejection,
and duplicate-prefix diagnostics. No compatibility score movement is inferred.

Still open: exact FightFX cache/promotion parity, complete Common1/default
tables, ZSS/Lua, raw IKEMEN InputBuffer internals, AI/SOCD, rollback/netplay,
broader visual/audio parity, the smoke-harness timeout, and full
MUGEN/IKEMEN parity.

## Next frontier

After CommonFx, the next source-backed lane is a bounded audit and selection
of remaining Common1/default-table behavior before opening ZSS/Lua admission.
