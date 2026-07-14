# Report: Official stage compatibility journey

## Result

Entry 527 adds `StageCompatibilityJourney/v1` around the official MUGEN 1.1b1
Training Room stage held in the local external fixture checkout. Entry 528 now
passes the browser render gate through the production ZIP input and Studio
Stage surface. The route is legal for noncommercial evidence use under the
distribution's Creative Commons Noncommercial sample-content notice, with no
binary asset committed here.

## Verified route

- The production `MugenStageLoader` loads `stage0.def` and `stage0.sff`.
- The stage report finds decoded SFF sprites, ordered background layers, and
  tiled coverage.
- `PlayableMatchRuntime` proves `resetBG` publishes tick `1` in round 1 and
  resets `backgroundTick` to `0` after starting round 2.
- Package digest, source URL, license path, required files, report, runtime
  checks, claims, and future gates are normalized in a frozen journey result.

## Verification

- Focal Vitest: 4 files, 213 tests passed.
- TypeScript 7: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- Browser stage smoke: passed through `pnpm qa:stage` at desktop and mobile;
  see `docs/reports/2026-07-14-official-stage-browser-gate.md`.
- Native regression/build/boundary closeout for this journey: not run yet.

## Claim ceiling

Journey status remains `partial` by design. This proves an official
noncommercial stage loader/report/runtime/browser route, not complete
MUGEN/IKEMEN stage parity or commercial redistribution. Next gate is native
closeout followed by optional-private corpus promotion.
