# IKEMEN RunFirst and RunLast root scheduling

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Which scheduling feature should follow bounded root MoveType/id RunOrder without exposing actor-list semantics the sandbox cannot represent?

## Primary sources

- IKEMEN GO `AssertSpecialFlag`, frame reset, `updateRunOrder`, and `CharList.action`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L66-L112> and <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11668-L11675> and <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175>.
- IKEMEN GO AssertSpecial compiler mapping: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L273-L280>.

## Findings

- `RunFirst` and `RunLast` are IKEMEN AssertSpecial flags retained across the normal per-frame AssertSpecial reset because scheduling consumes them elsewhere.
- Exclusive `RunFirst` receives priority `100`; exclusive `RunLast` receives `-100`; asserting both falls through to normal MoveType/root/helper priority.
- Sorting happens before command update and all prepare/run passes. The flags are cleared immediately after sorting.
- `RunOrder` depends on the complete ordered actor list, and helpers can be appended during the run loop. The current sandbox represents only two root fighters in this scheduler.

## Decision

Implement previous-tick `RunFirst` / `RunLast` for the two current roots under explicit `ikemen-go`. Preserve all non-IKEMEN pair order. Add a reusable trace-gate requirement for actor order in a named `MatchTickSchedule/v0` phase and require a synthetic imported RunFirst artifact.

## Blocked claims

The `RunOrder` trigger, helpers/appended actors, more than two roots, teams/simul/tag, exact pause/hitpause flag lifetime, simultaneous Pause/SuperPause overwrite, rollback timing, and full IKEMEN character-loop parity remain blocked.
