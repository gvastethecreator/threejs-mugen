# Repository-authored CC0 stage fixture closeout

Date: 2026-07-16
Slice: Wayfinder 217
Implementation commit: `134fb3d2`

## Result

The corpus now has a second first-party MUGEN-format input: the deterministic
`repository-skyline-relay` stage package. It is explicitly CC0, uses only
relative paths, and exercises stage assumptions absent from the character-only
MUGEN Lite journey.

## Evidence

| Area | Result |
| --- | --- |
| Focused fixture/loader tests | `2/2` passed |
| TypeScript 7 | `pnpm typecheck` passed |
| Fixture digest | Stable across two independently created VFS instances; SHA-256 format asserted |
| Loader/report | SFF v1 decoded, game space/localcoord, depth bounds, animated/tiled BG, and BGCtrl asserted |
| Path/license hygiene | Relative traversal-free paths and CC0 SPDX text asserted |
| Browser smoke | Not applicable: no visible UI or renderer change |

## Source basis

- [Elecbyte MUGEN 1.1b1 background/stage documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte coordinate-space documentation](https://www.elecbyte.com/mugendocs/coordspace.html)
- `src/mugen/loader/MugenStageLoader.ts`
- `src/mugen/compatibility/StageCompatibilityReport.ts`

## Claim ceiling

Allowed: a second repository-authored CC0 MUGEN-format stage input with
deterministic package identity and production loader/report evidence.

Blocked: executing this stage as a complete journey, browser/native proof,
snapshot aggregation, independent arbitrary-package breadth, score movement,
and full MUGEN/IKEMEN stage parity.

## Next frontier

Execute the Skyline Relay package through the bounded stage loader, runtime
round-reset/depth checks, native gates, and browser proof as T06. Aggregate it
into the v1.1 snapshot only after those artifacts exist and pass.
