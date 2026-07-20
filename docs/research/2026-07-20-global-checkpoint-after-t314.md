# Global checkpoint after T314

Date: 2026-07-20
HEAD: `6e74a68b`

## Delivered slice

T314 adds the bounded winner-display phase after the terminal round family.
The loader now carries the optional `win` display asset. Runtime snapshots
publish `RuntimeRoundWinnerDisplay/v0` with a `pending` or `active` phase,
display start frame, one-shot sound edge, and `win` or `draw` kind. The phase
starts from the existing post-KO phase-four boundary plus imported `win.time`.
Double KO Draw follows `dko.showdraw`, while a Time Over Draw uses the same
winner-display route with the imported draw asset and sound.

The renderer selects the winner or draw asset while the winner phase is active,
and audio consumes its `fs` sound edge through the existing archive and
deduplication path. Compatibility scores and full-port claims remain unchanged.

## Verification

- Focused T314 suites: 5 files / 320 tests passed after the feature commit.
- Full suite: 237 files / 2525 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The known large-chunk
  warning remains; the main JavaScript bundle is about 2.058 MB before gzip.
- `pnpm qa:trace`: passed with 633/633 artifacts, including 599 required and
  34 optional artifacts, with 0 failed artifacts.
- `pnpm qa:smoke`: passed across Runtime and Studio desktop/mobile routes in
  303.7 seconds. Root diagnostics report 0 console issues and 0 page errors.
- Capture review: Runtime desktop/mobile and Studio authoring/debug stayed
  visible without critical overlap. Studio Debug retains one pre-existing
  missing stage sound warning.
- `git diff --check`: passed for the T314 implementation and checkpoint.

## Global status

The port now carries a bounded post-round winner/draw presentation phase on
top of the T312 display families and T313 timing contract. The global port
remains partial and evidence-bound. Current scorecards and full MUGEN/IKEMEN
compatibility claims stay unchanged.

## Remaining boundary

- Exact `handleRoundOutro` ordering, legacy delay, and release ownership.
- Separate p1/p2, team, AI win/lose, win-type, perfect, and result-array
  selection.
- Exact `dko.showdraw` transition ownership, skip flags, and draw timing.
- Dialogue, motifs, direct imported screenpack browser proof, and exact sound
  sequencing.
- Exact palette, source aspect/anchor, `perspective2`, tile, and parallax
  behavior.
- Broader runtime ownership, rollback/netplay, Studio editing breadth, and
  full MUGEN/IKEMEN parity.

## Next implementation boundary

Introduce typed result selection for the source `p1`/`p2` and AI result arrays,
then connect the selected display to a direct imported screenpack browser
fixture. Keep team, perfect, win-type, and exact source-order behavior behind
explicit evidence gates.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go`,
  `.scratch/external/Ikemen-GO/src/common.go`, and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Out Of Scope

- Replacing the existing roadmap docs; this checkpoint records current
  evidence and the next executable boundary.
- Claiming full MUGEN/IKEMEN parity without the required imported-source and
  browser artifacts.
