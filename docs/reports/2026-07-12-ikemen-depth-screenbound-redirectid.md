# IKEMEN Depth and ScreenBound RedirectID report

## Outcome

`Depth` and `ScreenBound` now redirect from a caller to another live root through IKEMEN PlayerID identity. Invalid destinations fail closed. Controller and operation telemetry follows the affected root.

## Required evidence

`synthetic-imported-ikemen-depth-bounds-redirect.json` has P4 route `Depth player = 2,3` and `ScreenBound stagebound = 0` to P3 via `redirectid = 57`. Both controller events are recorded for P3, not P4. A second `Depth redirectid = 999` produces no controller event or extra operation.

- Checksum: `ca32f0ae`
- Final checksum: `37b3126b`
- Tests: 180 files / 1879 tests passed.
- TypeScript 7 typecheck: passed.
- Build: passed; existing chunk-size advisory remains.
- Boundaries: passed.
- Trace QA: 562/562 artifacts, 531 required and 31 optional.

## Boundary

Root targets only. Helper targets, exact dynamic payload context, recursive redirects, broader controller coverage, exact pause/reset timing, and full RedirectID parity remain blocked claims.
