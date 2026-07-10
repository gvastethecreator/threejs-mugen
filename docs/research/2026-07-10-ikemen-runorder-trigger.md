# IKEMEN root RunOrder trigger

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Can the sandbox expose IKEMEN `RunOrder` without claiming a helper/team actor list it does not yet execute?

## Primary sources

- IKEMEN GO `Char.runOrderTrigger`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5387-L5394>.
- IKEMEN GO expression compiler mapping: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L3563-L3568>.
- IKEMEN GO bytecode execution: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L3605-L3611>.
- IKEMEN GO sort/action loop: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175>.

## Findings

- `RunOrder` is a numeric trigger returning the actor's one-based position in `CharList.runOrder`.
- An actor missing from the list returns `-1`.
- The list is sorted before command update and action preparation, so triggers in that frame observe the newly sorted order.
- The sandbox currently has an exact ordered list only for two roots. Helpers execute through a separate effect/helper lifecycle and cannot honestly receive list indices yet.

## Decision

Stamp one-based indices on the explicit `ikemen-go` two-root order before frame-start trigger evaluation. Clear the value for `mugen-1.1` and `unknown`. Resolve `RunOrder` from runtime state with `-1` fallback, remove it from unsupported scanner findings, and require a trace where the value drives a CNS state branch.

## Blocked claims

Helper/appended-actor indices, parent/root redirect breadth, teams/simul/tag, exact Pause/hitpause ordering, actor creation/destruction during the loop, rollback timing, and full IKEMEN `RunOrder` parity remain blocked.
