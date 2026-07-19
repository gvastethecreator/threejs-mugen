# Research: FightScreen AnimTextSnd completion

Date: 2026-07-18
Question: What completion boundary is safe to carry from IKEMEN-GO into the
bounded AIR/SFF FightScreen renderer?

## Source findings

`AnimTextSnd.End(dt, inf)` uses `displaytime` when it is non-negative. When the
value is negative it returns completion for an empty animation, a source
animation that has reached its loop end, or, with `inf`, a final frame whose
duration is `-1`. `FightScreenRound.handleRoundIntro` checks the selected
Round variant and `round.default` together; the Fight call checks its own
`AnimTextSnd` and the configured sound-time boundary.

## Port decision

- Calculate a frame threshold without mutating the source animation state.
- Preserve `displaytime` precedence.
- Exclude the terminal `-1` sentinel from authored duration accumulation.
- Carry numbered/single/final/fight thresholds through the runtime timing
  contract.
- Hide completed visual phases while retaining their track telemetry and make
  the threshold visible in renderer diagnostics.

## Remaining boundary

The implementation intentionally does not claim exact FNT rasterization,
post-Action frame indexing for all malformed/negative AIR inputs,
top/background layers, palette effects, motif inheritance, dialogue, pause or
rollback persistence, or full visual parity.

## Primary source

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
