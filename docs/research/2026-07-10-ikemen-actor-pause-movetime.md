# IKEMEN actor-local Pause movement and p2defmul stacking

## Question

Does pinned IKEMEN GO source require per-character Pause/SuperPause movement allowances and multiplicative SuperPause target-defense buffering rather than one global moving actor?

## Answer

Yes. At revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, character state owns `pauseMovetime` and `superMovetime`; the action path consumes those values per character while the system gives SuperPause timer precedence. SuperPause target-defense buffering multiplies existing scale instead of replacing one global value.

## Sources

- [IKEMEN GO character pause setup and opposing-team defense buffer](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9032-L9090)
- [IKEMEN GO character move-time consumption](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11642-L11656)
- [IKEMEN GO buffered defense application](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12208-L12215)
- [IKEMEN GO Pause/SuperPause timer precedence](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2634-L2649)

## Implementation decision

- Keep actor move allowances per pause type under explicit `ikemen-go`.
- Execute eligible roots/helpers through the prepared actor list during a pause.
- Multiply positive same-frame `p2defmul` values for current target actors and restore the pre-session value once.
- Preserve `mugen-1.1` and `unknown` behavior.

## Uncertainty

This slice does not prove deferred activation when an actor requests a new Pause/SuperPause during the paused pass, helper-owned pause breadth, `p2defmul = 0`, teams, or exact hitpause ordering.
