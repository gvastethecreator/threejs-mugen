# IKEMEN stage depth bounds research

## Source baseline

Pinned Ikemen-GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- [`stage.go` PlayerInfo parser](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/stage.go#L1160-L1181) reads `topbound`, `botbound`, and player `startz` values.
- [`system.go` depth bounds](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2619-L2624) converts stage bounds with `stage.localscl`.
- [`char.go` stage clamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9896-L9907) divides the scaled limits by character `localscl` and clamps logical Z while `stagebound` is active.
- [`char.go` initial Z](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7346-L7352) applies the same stage-to-character localcoord conversion to `pXstartz`.

## Implemented interpretation

- Equal/default `topbound` and `botbound` leave depth bounds disabled.
- Unequal bounds are normalized and retained in stage-local coordinates.
- Runtime clamp converts each limit by `(320 / stageWidth) / (320 / actorWidth)`.
- Logical Z clamp remains independent from legacy `ScreenBound bound = 0`; IKEMEN's `stagebound` is a distinct flag.
- `p1startz` and `p2startz` use the same localcoord conversion at root creation.

## Boundary

This cut clamps the actor center. `Depth`/`DepthEdge` controller offsets, explicit `ScreenBound stagebound`, Z-axis player push, helper/projectile bounds, camera depth projection, and renderer placement remain pending.
