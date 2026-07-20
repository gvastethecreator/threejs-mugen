# Global checkpoint after T313

Date: 2026-07-20
HEAD: `d1d584ad`

## Delivered slice

T313 connects imported FightScreen outcome timing to the runtime and audio
boundaries. `RuntimeRoundOutcome/v0` now carries the selected terminal family,
display start frame, sound frame, one-shot sound edge, and `dko.showdraw`.
The adapter preserves KO defaults for omitted Double KO and Time Over values,
uses `win.time`/`win.sndtime` for the bounded Draw route, and maps selected
display sounds to the `fs` archive.

The renderer stays hidden until the selected source display start. The audio
system consumes the outcome edge once through the existing archive and
deduplication path. Compatibility scores and full-port claims remain
unchanged.

## Verification

- Focused Runtime, audio, FightScreen, and PlayableMatchRuntime tests: 4 files
  / 316 tests passed.
- Full suite: 237 files / 2524 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains; the main JavaScript bundle is about 2.057 MB before gzip.
- `pnpm qa:trace`: passed with 633/633 artifacts, including 599 required and
  34 optional artifacts, with 0 failed artifacts.
- `pnpm qa:smoke`: passed across Runtime and Studio desktop/mobile routes.
  The smoke diagnostics report 0 console issues and 0 page errors.
- Capture review: Runtime desktop/mobile and Studio authoring/debug stayed
  visible without critical overlap. Studio Debug retains one pre-existing
  missing stage sound warning.
- `git diff --check`: passed for the feature and checkpoint changes.

## Global status

The imported FightScreen route now carries bounded terminal display timing and
sound edges on top of the T312 outcome families. The global port remains
partial and evidence-bound. Current scorecards and full MUGEN/IKEMEN
compatibility claims stay unchanged.

## Remaining boundary

- Full `handleRoundOutro` phase order and the MUGEN legacy delay.
- Separate KO, winner, AI win/lose, perfect, and draw display assets.
- `dko.showdraw` transition ownership and winner display skip flags.
- Dialogue, motif, direct imported screenpack browser proof, and exact sound
  sequencing.
- Exact palette, source aspect/anchor, `perspective2`, tile, and parallax
  behavior.
- Broader runtime ownership, rollback/netplay, Studio editing breadth, and
  full MUGEN/IKEMEN parity.

## Next implementation boundary

Introduce a typed winner-display phase after the terminal family route, using
the imported `win` timing and `dko.showdraw` decision. Keep winner-specific
asset loading and direct screenpack browser proof as explicit follow-up gates.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
