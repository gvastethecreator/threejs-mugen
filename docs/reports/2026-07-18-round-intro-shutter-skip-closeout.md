# T287 Closeout: FightScreen intro shutter skip

- Date: 2026-07-18
- Entry: 561
- Code commit: `4d615c8f`
- Status: Closed at bounded scope

## Delivered

T287 ports the imported `shutter.time` and `shutter.col` configuration,
edge-triggered hard-button intro skip for both seats, the bounded raw
`roundnotskip` guard, `RuntimeRoundShutter/v0` state, and a Three.js symmetric
top/bottom shutter renderer. The intro boundary is reduced to the imported
control-time boundary without absorbing upstream character reset ownership.

## Verification

| Gate | Result |
| --- | --- |
| Focused loader/runtime/renderer tests | 4 files / 300 passed |
| Full Vitest suite | 233 files / 2484 passed |
| TypeScript | 7.0.2 typecheck passed |
| Production build | Passed, 317 modules |
| Trace compatibility | 633/633, 599 required + 34 optional |
| Architecture boundaries | Passed |
| Redirect boundary | Passed |
| CSS budget | Passed |
| Browser smoke | Passed, 64 paths, 0 console/page errors |

Browser diagnostics: `.scratch/qa/qa-smoke-t287-full/diagnostics.json`.
The build's existing greater-than-500 kB chunk warning is non-blocking and
unchanged in kind.

## Claim ceiling

The closeout proves only the shutter/skip boundary described above. Character
asset/position/state reset, exact announcement and display suppression,
dialogue, Common1/ZSS, motif/localcoord transforms, teams/Turns,
rollback/netplay, and full MUGEN/IKEMEN parity remain open. Scores stay
65 / 36 / 20 / 10-12 / 6-8 / 25.

## Next

Use the source-backed queue to select either FightScreen announcement/display
ownership or an independent character control/reset slice. Keep the next slice
separate, source-cited, and evidence-gated.
