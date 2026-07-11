# IKEMEN Tag RedirectID mutation ownership

## Question

What syntax, identity, evaluation context, and failure behavior must exist before TagIn/TagOut can mutate a redirected character safely?

## Answer

`RedirectID` is an optional integer expression that designates a global character PlayerID. It is not PlayerNo, a target ID, or the sandbox's string actor id. IKEMEN evaluates the redirect expression against the original caller, resolves it before the controller's parameter pass, and then evaluates all other Tag expressions against that same caller while applying mutations to the resolved character. The global lookup includes roots and Helpers, regardless of team; standby does not disqualify a character.

Negative, absent, destroyed, and disabled IDs fail lookup. TagIn/TagOut then return before state, control, order, partner, or standby mutation. IKEMEN's later Tag parameter pass remains incremental: a negative parameter can stop the scan after an earlier parameter already mutated the redirected character. This project deliberately retains aggregate prevalidation for its bounded Tag subset and does not claim exact partial-mutation parity.

## Primary sources

- [Official IKEMEN wiki: global RedirectID contract and PlayerID examples](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
- [Official IKEMEN wiki: TagIn/TagOut and Helper participation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- [Pinned compiler accepts optional integer redirectid for TagIn/TagOut](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L487-L553)
- [Pinned redirect lookup evaluates caller expression before mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4840)
- [Pinned TagIn/TagOut caller evaluation and redirected mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5398)
- [Pinned global PlayerID lookup and disabled/destroyed filtering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)
- [Pinned root ID initialization and monotonic allocation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2005-L2099)
- [Pinned Helper PlayerID allocation and shared CharList idMap](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6752-L6795)
- [Pinned default HelperMax baseline](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/resources/defaultConfig.ini#L111)

## Local audit

- `FighterMatchState.id` and Helper `serialId` are stable string identities; neither represents IKEMEN PlayerID.
- `RuntimeMatchActorRosterWorld.createCharacterRegistry(...)` and `MatchWorldActorRegistrySnapshot.byId` are immutable diagnostic/string lookup paths, not a live numeric mutation registry.
- `ExpressionContext` has no character PlayerID or PlayerNo field, and `ExpressionEvaluator` does not implement `ID` or `PlayerNo`.
- `applyTeamStandbyController(...)` currently accepts the executing root directly and only searches P1-P8 roots by stable string id for leader selection.
- Helpers do not implement the root Tag standby/order model, so official Helper redirects require a later semantic gate even after identity lookup exists.

## Implementation decision

1. Create a generic numeric character-identity world with a separate immutable diagnostic.
2. Match pinned root assignment order and default baseline without changing public string actor ids.
3. Integrate roots, then expression `ID`/`PlayerNo`, then Helper lifecycle, each as a separate feature commit.
4. Admit root-only Tag RedirectID only after caller evaluation, active lookup, mutation/telemetry ownership, and rollback behavior are covered end to end.

## Uncertainty

Exact round-to-round ID refresh, configurable `HelperMax` ingestion, preserved Helpers, redirected Helper Tag semantics, disabled lifecycle ownership, console-warning parity, incremental partial mutation, and broad RedirectID support outside TagIn/TagOut remain open.
