# IKEMEN Depth controller research

## Source baseline

Pinned Ikemen-GO revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- [`compiler_functions.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6311-L6342) parses mutually selected `edge`, `player`, or fallback `value` pairs plus optional `redirectid`.
- [`bytecode.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14469-L14512) converts caller values into the redirected character's localcoord. `player` applies body depth, `edge` applies stage-edge margins, and `value` applies both. A missing second value evaluates as zero.
- [`char.go` setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7696-L7715) add player values to base body depth and assign edge values directly.
- [`char.go` reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11818-L11829) restores base player depth and zero edge depth when no current-frame controller owns them.
- [`char.go` clamp](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9897-L9909) adds top edge depth and subtracts bottom edge depth from stage bounds.

## Implemented interpretation

- Typed `collision:depth` operations preserve mode and pair.
- Static and expression-backed self-owned `player`, `edge`, and `value` forms execute through the active controller pipeline.
- Body depth overrides use the frame's original base pair; edge overrides affect stage Z clamp.
- Both overrides reset on the next constraint frame.
- Playable roots and explicit active-motion Tag roots execute the controller.

## Boundary

`redirectid`, helper-local Depth execution, exact hitpause persistence/reset timing, multiple redirected localcoord combinations, explicit `ScreenBound stagebound`, and Z player push remain pending.
