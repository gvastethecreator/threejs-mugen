# Global checkpoint after T311

Date: 2026-07-20  
HEAD: `844695d7`

## Delivered slice

T311 shares the source-derived FightScreen `Layout` contract between primary
`AnimTextSnd` AIR and bitmap FSText. The display-level transform now carries
layer, rotation, x/y rotation, shear, projection, focal length, and window
fields. FSText uses that layout by default, with an explicit nested text
override available for authored extensions. Both paths use transformed-window
clipping, UV interpolation, pooled geometry recovery, and separate diagnostics.

## Verification

- Focused loader and FightScreen renderer tests: 2 files / 11 tests passed.
- Full suite: 237 files / 2521 tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed, 323 transformed modules. The known large-chunk
  warning remains; the main JavaScript bundle is about 2.05 MB before gzip.
- `qa:smoke`: passed for Runtime and Studio desktop/mobile routes.
- Capture review: Runtime desktop/mobile and Studio authoring/debug remained
  visible without critical overlap. Runtime and Studio authoring reported zero
  browser errors and warnings. Studio debug keeps one pre-existing missing
  stage sound warning.
- `git diff --check`: passed before the feature commit.

## Global status

The FightScreen route now covers bounded top/background transforms and the same
transform ownership for primary AIR and bitmap FSText. Compatibility scores
and full-port claims remain unchanged. This checkpoint does not prove exact
IKEMEN frustum or scissor math, `perspective2`, source aspect and anchor
correction, tile/parallax, palette math, TrueType/binary FNT, KO/winner
families, direct imported screenpack browser parity, rollback/netplay, or full
MUGEN/IKEMEN compatibility.

## Next implementation boundary

Add the remaining FightScreen display families through the shared transform
contract, then validate those paths against direct imported screenpack assets.
Keep `perspective2`, exact palette behavior, and source aspect correction as
separate evidence lanes.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
