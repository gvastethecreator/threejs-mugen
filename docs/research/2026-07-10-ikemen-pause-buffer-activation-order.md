# IKEMEN Pause buffer activation order

## Question

When a character requests Pause or SuperPause during character action, should that request replace the active pause immediately and stop later actors in the same character-list pass?

## Answer

No. At pinned revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, the system decrements active SuperPause/Pause timers, activates previously buffered timers, then runs the character list. A controller request made during that character action writes the buffer for a later system step; it does not replace the current timer in the middle of that actor-list pass.

## Sources

- [IKEMEN GO Pause and SuperPause buffer writes](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9032-L9090)
- [IKEMEN GO timer step, buffer activation, and character action order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2627-L2655)

## Implementation decision

- Queue Pause/SuperPause replacements while the paused actor list runs under explicit `ikemen-go`.
- Preserve same-frame pending arbitration and actor-local move-time writes.
- Tick the old active pause before committing pending slots for the next runtime branch.
- Cancel pending activation if actor execution throws.

## Uncertainty

Runtime trace snapshots observe the committed replacement at frame end rather than reproducing IKEMEN's internal negative-buffer representation. Helper-created requests, exact hitpause interaction, and teams remain separate gates.
