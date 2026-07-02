# Stage Compatibility Matrix

This document defines how imported stage support is planned and reported. Stage support must separate parsing, renderer-independent stage facts, Three.js presentation, and unsupported/fallback behavior.

## Stage Support Levels

| Level | Meaning |
| --- | --- |
| Parsed | Stage DEF/BGDef syntax was read. |
| Decoded | Referenced sprite/audio payloads were decoded. |
| Modeled | Stage data was compiled into renderer-independent IR. |
| Rendered Partial | Three.js rendered a documented subset. |
| Rendered Parity | Tested behavior is expected to match the original engine for the covered case. |
| Fallback | A placeholder/native fallback was used. |
| Unsupported | Known stage feature is not implemented. |
| Unknown | Feature was found but not classified. |

## Feature Matrix

| Feature | First Target | Current/Planned Claim | Gate |
| --- | --- | --- | --- |
| DEF metadata | MUGEN 1.0/1.1 | Parsed. | Stage report. |
| Player starts | MUGEN 1.0/1.1 | Parsed/modeled. | Stage preview/debug facts. |
| Bounds | MUGEN 1.0/1.1 | Parsed/modeled. | Runtime camera/floor screenshot. |
| Z offset/floor | MUGEN 1.0/1.1 | Parsed/modeled/rendered partial. | Visual QA with floor overlay. |
| Localcoord | MUGEN 1.1 | Parsed/partial. | KFM720/stage scale sanity. |
| BG static layers | MUGEN 1.0/1.1 | Rendered partial. | Screenshot and layer report. |
| BG animated action layers | MUGEN 1.0/1.1 | Rendered partial. | Layer timeline evidence. |
| Delta/parallax | MUGEN 1.0/1.1 | Rendered partial. | Camera pan screenshot/trace. |
| Tiling | MUGEN 1.0/1.1 | Rendered partial. | Screenshot and report. |
| Velocity | MUGEN 1.0/1.1 | Bounded partial through recognized BGCtrl types. | Time-based visual QA. |
| Window/mask | MUGEN 1.0/1.1 | Bounded rectangular `window` / `maskwindow` clipping metadata plus Three.js geometry/UV clipping; color-zero `mask` remains partial/blocked. | Parser/report/projection tests plus smoke visual QA. |
| BGCtrl | MUGEN 1.0/1.1 | Bounded partial for `Visible`, `Enabled`, `VelSet`, `VelAdd`, `PosSet`, `PosAdd`, `Anim`, `SinX`, and `SinY`; exact parity unsupported. | Report classifies bounded/unsupported and `BGCtrl Lab` smoke proves native visible rows/canvas. |
| Stage SND/music | MUGEN 1.0/1.1 | Diagnostics first. | Audio event/decode report. |
| IKEMEN stage extensions | IKEMEN scan | Recognized/unsupported. | Profile scanner report. |

## Stage IR Goal

Stage runtime facts should be renderer-independent:

```txt
StageDef
  -> StageIr
  -> camera/floor/bounds facts
  -> layer records
  -> asset references
  -> unsupported feature records
  -> Three.js stage renderer
  -> Stage Studio preview/report
```

Three.js should not be the source of stage truth.

## Stage Studio Requirements

Stage Studio should show:

- metadata and source files
- floor/zoffset
- camera/bounds
- player starts
- localcoord and scale notes
- BG layer list
- rendered/fallback/unsupported state per layer
- missing asset references
- screenshot evidence
- related compatibility report entries

## Reporting Rules

- Do not say `stage supported` when some layers are fallback or missing.
- Do not hide exact BGCtrl/windowdelta/zoom/mask color-key/parallax gaps.
- Do not let a native stage prove imported stage compatibility.
- Every visible stage change requires browser visual QA.

## Closeout

Stage implementation rounds should close with:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm qa:smoke
```

If the change is fixture-specific, also save a focused screenshot/report under `.scratch/qa/<stage-feature>/`.
