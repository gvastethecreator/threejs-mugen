# Ikemen root depth-admission report

## Outcome

Root direct-hit admission consumes logical combat depth without changing X/Y Clsn ownership.

## Paths

- HitDef: attacker active attack depth versus getter body depth.
- ReversalDef clash: directed attacker attack depth versus getter active attack depth.
- Reversal clash mutation: repeats the same depth predicate before mutation.
- Legacy actor without `combatDepth`: depth gate passes, preserving existing 2D routes.

## Oracle

Pinned Ikemen-GO `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `src/char.go` lines 13299-13311 and `src/system.go` lines 1928-1935.

## Evidence

- Focused: 4 files, 579 tests passed.
- Cases: direct depth miss, scaled edge-touch reversal admission, mutation-time stale depth rejection, existing required trace preset regression.
- TypeScript 7 typecheck passed.
- Full regression/build/boundary gates run before commit.

## End-to-end promotion

Superseded by required trace `synthetic-imported-ikemen-active-root-depth-miss`: CNS `PosSet z=20` now produces a root admission `no-contact`, zero admitted pairs, unchanged life/targets, and no combat event through playable `MatchWorld`. Trace QA: 553/553 artifacts passed, 522 required; checksum `7719d4ec`.
