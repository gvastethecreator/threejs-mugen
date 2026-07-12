# Ikemen combat-depth model implementation report

## Outcome

Implemented actor-owned logical combat depth without coupling it to Three.js render Z.

## Runtime contract

- `position`: logical Z position, currently initialized to `0`.
- `size`: character body depth, default `[3,3]`.
- `attack`: HitDef/ReversalDef attack depth, default `[4,4]`.
- `runtimeCombatLocalScale`: `320 / localcoord.width`, default `1`.
- `runtimeDepthRangesOverlap`: edge-inclusive asymmetric interval comparison with independent local scales.

## Source oracle

Pinned Ikemen-GO commit: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- Character defaults: `src/char.go` CharSize initialization.
- HitDef reset from `size.attack.depth`: `src/char.go` line 800.
- Scaled edge-inclusive overlap: `src/system.go` lines 1928-1935.
- Reversal/ordinary depth ownership: `src/char.go` lines 13299-13307.

## Evidence

- Focused: 6 test files, 43 tests passed, including fresh-HitDef default reset.
- TypeScript 7: `tsc --noEmit` passed.
- Full regression/build/boundary gates run before commit.

## Remaining boundary

No combat admission reads the depth model yet. This prevents partial Z behavior from silently changing existing 2D matches before direct and reversal routes share the same proven predicate.
