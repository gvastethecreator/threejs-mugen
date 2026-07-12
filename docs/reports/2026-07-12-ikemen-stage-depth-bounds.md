# IKEMEN stage depth bounds report

## Outcome

Imported stages now own bounded logical depth through `topbound`, `botbound`, `p1startz`, and `p2startz`.

## Runtime coverage

- Stage parser and typed model preserve depth bounds and starts.
- Root spawn converts stage-local Z into character-local Z.
- Normal, paused, and post-fighter root constraint paths clamp logical Z.
- Z clamp is independent from legacy X `ScreenBound bound = 0` behavior.
- Required Tag trace authors `PosSet z = 20`, clamps the 160-localcoord P3 to Z `5` under a 320-localcoord stage bound of `10`, and reaches hit admission without contact against P4 at Z `-5`.

## Evidence

- Full regression: 180 files, 1865 tests passed.
- TypeScript 7 typecheck passed.
- Production build passed; the existing chunk-size advisory remains non-blocking.
- Boundary check passed.
- Trace QA: 558/558 artifacts passed, 527 required and 31 optional.
- Required artifact checksum: `c12d5a6e`; final checksum: `c08cbae7`.
- Current checksum after depth player-push promotion: `47cda3cc`; final checksum: `9c14fd01`. The asserted P3/P4 Z outcome remains `5/-5`.

## Honest boundary

Center bounds are implemented. `Depth`/`DepthEdge`, explicit `ScreenBound stagebound`, Z player push, helper/projectile bounds, visual depth projection, and full MUGEN/IKEMEN parity remain blocked claims.
