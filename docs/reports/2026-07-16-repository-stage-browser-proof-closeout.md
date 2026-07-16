# Repository stage browser proof closeout

Date: 2026-07-16
Slice: Wayfinder 219 (T06-b)
Implementation commits: `c9522739`, `b259153d`

## Result

The repository-authored package is now proven through the application's real
ZIP and browser folder import paths. Both transports load MUGEN Lite Journey
and Skyline Relay, preserve the same source identity, and reach the visible
Studio Stage surface.

## Evidence

| Area | Result |
| --- | --- |
| Focused package/folder/journey tests | `7/7` passed |
| Full test suite | `219/219` files, `2292/2292` tests passed |
| TypeScript 7 | `pnpm typecheck` passed |
| Production build | passed; existing large-chunk warning remains |
| Boundary check | passed |
| ZIP/folder source identity | same fingerprint, `12` files |
| Skyline Relay loader/report | `3` layers, `4/4` SFF sprites, `1` animated, `1` tiled, `1/1` bounded BGCtrl |
| Desktop canvas | non-blank, `45` sampled colors, no overflow |
| Mobile canvas | non-blank, `79` sampled colors, no overflow |
| Browser diagnostics | `0` page errors, `0` console issues |

## Artifacts

Command: `pnpm run qa:stage:repository`

Output directory: `.scratch/qa/repository-skyline-relay-browser/`

- `browser-diagnostics.json`
- `repository-skyline-relay-browser-desktop.png`
- `repository-skyline-relay-browser-desktop-canvas.png`
- `repository-skyline-relay-browser-mobile.png`
- `repository-skyline-relay-browser-mobile-canvas.png`

## Source basis

- `src/mugen/loader/MugenCharacterLoader.ts`
- `src/mugen/loader/FolderCharacterSource.ts`
- `src/mugen/runtime/RepositoryStagePackage.ts`
- `scripts/qa_repository_stage_compatibility.cjs`
- `App` ZIP and folder import handlers in `src/app/App.ts`

## Claim ceiling

Allowed: visible ZIP/folder application import and desktop/mobile Skyline Relay
stage Studio evidence.

Blocked: full `StageCompatibilityJourneyResult` artifact aggregation, native
regression fields, compatibility snapshot promotion, score movement, arbitrary
third-party package breadth, and complete MUGEN/IKEMEN stage parity.

## Next frontier

Materialize one immutable journey artifact that references the runtime and
browser outputs, validate its parser/checksum, then decide whether it qualifies
for the next compatibility snapshot without silently promoting native claims.
