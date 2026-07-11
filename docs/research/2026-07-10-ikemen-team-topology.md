# IKEMEN team topology and character selection

## Question

What minimum topology must the runtime model before pair-only scheduling can expand toward IKEMEN simul/tag teams?

## Answer

Pinned IKEMEN GO keeps a complete character list separate from the `sys.chars[playerNo]` root/helper slots. Root player numbers are interleaved by side: zero-based even slots represent P1/P3/P5/P7 and odd slots represent P2/P4/P6/P8. Helpers inherit the root `teamside`. Complete opposing-team loops compare `teamside`; active opponent selection additionally excludes disabled/standby characters and applies root/player-type rules.

## Primary sources

- [IKEMEN GO CharList creation/run-order ownership](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12862-L12930)
- [IKEMEN GO Partner/Enemy root-slot enumeration](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4943-L5006)
- [IKEMEN GO enemy eligibility and standby exclusion](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5064-L5085)
- [IKEMEN GO EnemyNear/P2 selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13903-L13980)

## Implementation decision

- Introduce one character topology that resolves side from root identity and enumerates complete same/opposing-team characters in stable roster order.
- Map `p1/p3/p5/p7` to side 1 and `p2/p4/p6/p8` to side 2; helper identity uses `rootId`.
- Reuse that policy for CNS `TeamSide` and SuperPause complete opposing-character projection.
- Keep active/standby opponent eligibility, nearest-opponent ordering, multi-root scheduling, input, combat, round, and presentation as later vertical cuts.

## Uncertainty

The playable runtime still constructs two roots only. Tag state transitions, standby snapshots, partner redirects, multi-root combat, life/power sharing, round outcomes, and UI remain unimplemented.
