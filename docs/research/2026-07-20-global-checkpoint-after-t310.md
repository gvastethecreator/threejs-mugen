# Global checkpoint after T310

Date: 2026-07-20
HEAD: `b8cfed24`

## Delivered slices

- T308: `xangle` and `yangle` reach top/background layouts through the source
  X sign and the bounded orthographic plane path.
- T309: typed `projection` and `focallength` reach layouts; `perspective` uses
  finite quad deformation and `perspective2` stays explicit and culled.
- T310: transformed top/background quads clip against rectangular `window`
  bounds with interpolated UVs and pooled triangle geometry.

Commits:

- `eabd086c feat(render): carry FightScreen x/y layout angles`
- `48ce6d0c feat(render): carry FightScreen perspective layouts`
- `b8cfed24 feat(render): clip transformed FightScreen windows`

## Verification

- Focused FightScreen/loader tests: 2 files / 10 tests passed.
- Full suite: 237 files / 2520 tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed, 323 transformed modules. The known large-chunk
  warning remains; current JavaScript output is about 2.05 MB before gzip.
- `qa:trace`: 633/633 artifacts passed, 599 required and 34 optional.
- `check:boundaries`: passed.
- `check:redirect-boundary`: passed.
- `qa:css:budget`: passed, 324085/536051 bytes and 1519/2364 rules.
- `qa:assets:hygiene`: passed with zero violations.
- `qa:smoke`: passed for Runtime and Studio desktop/mobile routes.
- Capture review: Runtime desktop/mobile and Studio authoring/debug stayed
  visible without critical overlap. Runtime and Studio authoring reported zero
  browser errors and warnings. Studio debug keeps one pre-existing missing
  stage sound warning.

## Global status

The FightScreen top/background transform route now covers bounded rotation,
shear, perspective, and transformed rectangular clipping. The full port and
compatibility scores remain unchanged. This checkpoint does not prove exact
Ikemen frustum, `perspective2`, source palette math, primary/text transform
ownership, KO/winner families, direct imported FightScreen browser parity,
rollback/netplay, or complete MUGEN/IKEMEN compatibility.

## Next implementation boundary

Unify transform ownership for primary `AnimTextSnd` and FSText, then add the
remaining FightScreen display families with the same source-backed evidence
and claim ceiling.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go

