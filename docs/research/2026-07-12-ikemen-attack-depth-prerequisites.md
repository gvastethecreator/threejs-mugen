# Ikemen attack-depth prerequisites

## Decision

Preserve explicit `attack.depth` now. Do not map logical combat depth onto Three.js scene Z. Actor position/size depth and localcoord-aware overlap remain a separate runtime capability.

## Pinned source

Oracle: Ikemen-GO commit `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- `compiler_functions.go` lines 2237-2239 accepts `attack.depth` as one or two floats.
- `bytecode.go` lines 7874-7879 assigns both values and duplicates the first when the second is omitted.
- `char.go` line 800 defaults HitDef depth from character `size.attack.depth`.
- `char.go` lines 13299-13307 compares ReversalDef attack depth against the getter's attack depth; ordinary HitDef compares it against getter size depth.

Primary references:

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L2237-L2239
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L7874-L7879
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L792-L801
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13299-L13311

## Local audit

- `CharacterRuntimeState.pos` and `vel` are X/Y-only.
- `DemoMove`, typed HitDef, and typed ReversalDef previously discarded `attack.depth`.
- Imported character constants can carry future defaults, but no combat-depth owner currently consumes them.
- Existing Three.js Z is presentation space and cannot establish Ikemen combat-depth semantics.

## Bounded implementation

- Add optional `[front, back]` attack depth to typed HitDef/ReversalDef operations.
- Normalize a one-value parameter to `[value, value]`.
- Preserve it on active `DemoMove` and `RuntimeReversalDef`.
- Leave collision admission unchanged until actor `posZ`, `sizeDepth`, defaults, and localcoord scaling have explicit ownership and tests.

## Next proof cut

Wayfinder 124 should introduce a renderer-independent combat-depth value object and actor defaults, then prove overlap/non-overlap with asymmetric front/back extents before wiring it into direct/reversal admission.
