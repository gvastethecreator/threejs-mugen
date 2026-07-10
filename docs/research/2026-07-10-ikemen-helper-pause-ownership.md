# IKEMEN helper Pause ownership

## Question

Should a helper-created Pause/SuperPause be attributed to its root fighter or to the helper character executing the controller?

## Answer

IKEMEN GO implements Pause/SuperPause on `Char`; the methods use the executing character's `playerNo`, movement fields, state block, and helper-aware character identity. Therefore the global pause owner and local movetime belong to the helper character, while team-level resources and asset ownership still require the root context.

## Sources

- [IKEMEN GO character Pause/SuperPause methods](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9032-L9090)
- [IKEMEN GO per-character movement consumption](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11642-L11656)

## Implementation decision

- Use helper serial id and helper state for pause identity and telemetry.
- Apply SuperPause power delta through the root fighter resource.
- Store SuperPause sound on the helper snapshot using the root definition's asset namespace.
- Refresh helper-local pause/super move time from the controller result.
- Apply positive `p2defmul` only to current helper targets until team roster breadth is implemented.

## Uncertainty

Opposing-team-wide defense buffering, `p2defmul = 0`, nested helper asset ancestry, exact audio playback, teams, and hitpause ordering remain separate gates.
