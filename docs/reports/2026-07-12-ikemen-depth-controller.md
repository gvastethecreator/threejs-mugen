# IKEMEN Depth controller report

## Outcome

Imported root CNS can now author one-frame body-depth and stage-edge-depth overrides with the IKEMEN `Depth` controller.

## Supported

- `Depth player = top,bottom`.
- `Depth edge = top,bottom`.
- `Depth value = top,bottom`, applying both modes.
- Omitted second values default to zero.
- Static typed lowering and dynamic expression resolution.
- One-frame reset to imported base body depth and zero edge margin.
- Active playable and explicit active-motion Tag roots.
- Typed `collision:depth` controller telemetry.

## Required evidence

`synthetic-imported-ikemen-depth-controller` runs active P3 with `PosSet z = 20` and `Depth value = 2,3` against stage bounds `-10,10`. Character `localcoord` conversion yields an ordinary bottom bound of `5`; edge depth lowers it to `2`, while player depth expands P3 contact depth from `[3,3]` to `[5,6]`. P3 then contacts P4 at Z `-5` for 37 damage.

- Required checksum: `f4e10380`; final checksum: `3cfbad85`.
- Current checksum after depth player-push promotion: `bd050230`; final checksum: `0a6abca8`. The asserted 37-damage contact remains unchanged.
- Trace QA: 559/559 artifacts passed, 528 required and 31 optional.
- Full regression: 180 files, 1870 tests passed.
- TypeScript 7 typecheck, production build, and boundary check passed.
- Existing production chunk-size advisory remains non-blocking.

## Honest boundary

No `redirectid`, helper-local controller route, exact hitpause persistence, explicit `ScreenBound stagebound`, Z player push, visual depth projection, or full MUGEN/IKEMEN parity claim.
