# IKEMEN root-player RunOrder

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Which ticket 032 scheduler package is the smallest source-backed behavior change that improves actor order without asserting unsupported MUGEN or helper parity?

## Answer

Add a match-level runtime profile and a named root-player RunOrder policy. Under `ikemen-go`, order the two current root players by IKEMEN's observed priorities: attacking (`MoveType = A`) before idle (`I`) before remaining states, then lower runtime id. Under `mugen-1.1` and `unknown`, preserve current pair order because the checked sources do not establish equivalent MUGEN behavior. Defer `RunFirst` / `RunLast`, helpers, appended actors, and `RunOrder` trigger parity.

## Primary sources

- IKEMEN GO `CharList.updateRunOrder` and `CharList.action`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13096-L13175>
- IKEMEN GO `Char.actionPrepare` and `Char.actionRun`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11808>
- Elecbyte CNS state and MoveType reference: <https://www.elecbyte.com/mugendocs/cns.html>

## Findings

- IKEMEN sorts the complete character run list before command update and before every character's prepare/run passes.
- Priority order is `RunFirst`, attacking players/helpers, idle root players, remaining root players, idle helpers, remaining helpers, then `RunLast`; equal priorities use lower character id first.
- The current sandbox has two root players and advances fixed P1 then P2. It does not execute helper CNS actors inside the root-player loop and has no `RunFirst` / `RunLast` runtime flags.
- Applying IKEMEN ordering unconditionally would claim MUGEN behavior without checked evidence. Character package detection is also not a safe substitute for selecting the match engine profile.

## Decision impact

- Introduce reusable `RuntimeCompatibilityProfile` and explicit `runtimeProfile` match option.
- Add `RuntimeFighterRunOrderWorld` for bounded root-player ordering.
- Make pre/post automatic guard and fighter passes follow the selected order while preserving the all-prepare-before-run shape.
- Prove IKEMEN `A > I > H`, lower-id tie order, non-IKEMEN preservation, and public match schedule actor order.

## Blocked claims

Exact MUGEN root-player order, IKEMEN `RunFirst` / `RunLast`, helper insertion and helper CNS execution, more than two roots, `RunOrder` trigger values, team/simul/tag ordering, simultaneous Pause overwrite parity, and full IKEMEN character-loop parity remain blocked.
