# Add repository-authored CC0 stage fixture

Type: task
Status: resolved
Blocked by: None

## Question

What is the smallest independent legal route that broadens the corpus beyond
the existing character-only MUGEN Lite package without importing third-party
material?

## Answer

The repository now owns a deterministic MUGEN-format stage package named
`repository-skyline-relay`. It carries a machine-readable CC0 license, a
relative-path manifest, a generated SFF v1 archive, a 640x480 stage localcoord,
1280x720 game-space config, depth bounds, an animated/tiled background, a
bounded BGCtrl, and `resetBG = 0`. These assumptions differ materially from
the existing 320x240 character journey and its 640x480 demo stage.

## Authority

- Elecbyte's stage documentation defines `[Info]`, `[Camera]`, `[PlayerInfo]`,
  `[StageInfo]`, `[BGDef]`, `[BG]`, and BG controller sections.
- The repository's production `MugenStageLoader`, `StageDefParser`, SFF
  parser, and stage compatibility report are the only execution owners used
  by the fixture test.

## Boundaries

Included: repository-authored stage files, CC0 provenance, deterministic SFF
v1 input generation, package digest stability, path hygiene, and production
loader/report coverage.

Deferred: journey aggregation, runtime trace artifact, native/browser proof,
snapshot aggregation, score adjudication, and full stage/render parity.

## Verification

- Focused `RepositoryStageFixture.test.ts`: `2/2` passed.
- `pnpm typecheck`: passed.
- `git diff --check` on the feature files: passed.
- No browser smoke was required: this cut adds a fixture and loader/report
  coverage but does not change the visible application.

Claim ceiling: the repository has a second named, CC0, MUGEN-format stage
input with stable digest and loader/report evidence. It is not yet a complete
compatibility journey and does not move any score.
