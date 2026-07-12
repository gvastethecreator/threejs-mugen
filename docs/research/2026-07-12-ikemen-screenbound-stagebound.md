# IKEMEN ScreenBound stagebound research

## Source baseline

Pinned Ikemen-GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- [`compiler_functions.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L3269-L3302) parses `value`, `movecamera`, optional `stagebound`, and optional `redirectid`. `value` and `movecamera` default false; omitted `stagebound` does not write the flag.
- [`bytecode.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L10159-L10206) mutates screen, camera, and stage-bound flags independently.
- [`char.go` frame reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11605-L11621) restores `stagebound` true outside hitpause before CNS controllers run.
- [`char.go` X clamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9875-L9894) separates screen-bound/camera geometry from stage left/right bounds.
- [`char.go` Z clamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9897-L9909) applies depth bounds only while `stagebound` is true.

## Implemented interpretation

- Static and expression-backed `stagebound` compile into optional `bounds:screenbound` telemetry.
- Omission preserves the current frame's stage-bound flag, allowing multiple ScreenBound controllers to compose.
- Frame reset uses absence as the official true default; authored false is represented explicitly.
- Z clamp obeys `stagebound` independently from `value` and `movecamera`.
- Explicit active-motion Tag roots may execute ScreenBound.

## Boundary

The local X path still combines historical screen/stage bounds behind `value`; changing it would invalidate established compatibility traces. Exact X stage-vs-screen geometry, `redirectid`, helpers, hitpause reset timing, and camera-depth projection remain pending.
