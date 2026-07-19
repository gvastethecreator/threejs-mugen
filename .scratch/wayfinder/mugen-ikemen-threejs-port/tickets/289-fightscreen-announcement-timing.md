# T289: Import FightScreen announcement timing

- Type: research + implementation
- Status: resolved at bounded source-transport scope
- Date: 2026-07-18
- Entry: 563

## Question

Which FightScreen announcement data must cross the loader/runtime boundary
before phase execution and visible display work can be implemented safely?

## Answer

Import the five `[Round]` timing fields as a typed
`RuntimeRoundAnnouncementTiming/v0` value:

- `round.time` and `round.sndtime`
- `callfight.time`
- `fight.time` and `fight.sndtime`

Keep the boundary timing-only. The upstream `FightScreenRound` owns phase
timers, sound dispatch, animation selection, `SkipRoundDisplay`, and
`SkipFightDisplay`; shutter gating is a separate early return. This ticket does
not claim announcement phases, display suppression, asset rendering, audio
playback, dialogue, motif/localcoord transforms, or full parity.

## Sources

- Local pinned source: `.scratch/external/Ikemen-GO/src/fightscreen.go:3084-3240`
  defines the fields, defaults, and `[Round]` reads.
- Local pinned source: `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3467`
  keeps shutter skip separate from announcement handling.
- Local pinned source: `.scratch/external/Ikemen-GO/src/fightscreen.go:3490-3632`
  owns round/fight phase progression, sound timing, and display skip flags.
- Official pinned source:
  [Ikemen-GO `fightscreen.go` at `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go).
- Official pinned source:
  [Ikemen-GO `system.go` at `05b7d98`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go).

## Implementation boundary

T289 adds parser fields, a normalized runtime timing contract, and transport
through the existing FightScreen timing adapter. T290 should add a reset-owned
phase state machine; T291 can then connect display assets/audio and explicit
skip flags without hiding missing support behind the timing import.
