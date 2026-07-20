# Global checkpoint after T312

Date: 2026-07-20
HEAD: `5d032267`

## Delivered slice

T312 adds typed FightScreen outcome display families for KO, Double KO, Time
Over, and Draw. The loader preserves their display definitions and source
timing fields. The renderer selects a terminal family from the existing
round snapshot after visible Round/Fight announcements close, then reuses the
shared AIR, FSText, layout, transform, window, layer, palette, and completion
paths.

The selection route keeps explicit fallback behavior for incomplete imported
definitions: Double KO can use the KO asset, and Draw can use the Time Over
asset. The feature does not advance compatibility scores or full-port claims.

## Verification

- Focused loader and FightScreen renderer tests: 2 files / 12 tests passed.
- Full suite: 237 files / 2522 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains; the main JavaScript bundle is about 2.05 MB before gzip.
- `pnpm qa:trace`: passed with 633/633 artifacts, including 599 required and
  34 optional artifacts, with 0 failed artifacts.
- `pnpm qa:smoke`: passed across Runtime and Studio desktop/mobile routes.
  The smoke diagnostics report 0 console issues and 0 page errors.
- Capture review: Runtime desktop/mobile and Studio authoring/debug stayed
  visible without critical overlap. Studio Debug retains one pre-existing
  missing stage sound warning.
- `git diff --check`: passed for the feature and checkpoint changes.

## Global status

The imported FightScreen path now covers bounded Round/Fight presentation and
terminal outcome family selection on top of the T311 shared transform route.
The global port remains partial and evidence-bound. The current scorecards and
full MUGEN/IKEMEN compatibility claims stay unchanged.

## Remaining boundary

- Exact `handleRoundOutro` delay and phase order.
- `dko.showdraw`, winner-specific `win` content, and complete source timing
  consumption.
- Dialogue, motif, sound, skip, and direct imported screenpack browser proof.
- Exact palette, source aspect/anchor, `perspective2`, tile, and parallax
  behavior.
- Broader runtime ownership, rollback/netplay, Studio editing breadth, and
  full MUGEN/IKEMEN parity.

## Next implementation boundary

Connect terminal family selection to the imported round outro timing owner,
starting with the source `ko.time`/`sndtime` and `dko.showdraw` decisions.
Keep direct screenpack browser evidence separate from synthetic route smoke.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go`,
  `.scratch/external/Ikemen-GO/src/common.go`, and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
