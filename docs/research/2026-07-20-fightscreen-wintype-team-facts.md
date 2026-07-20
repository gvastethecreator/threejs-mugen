# FightScreen winType team facts

Date: 2026-07-20
Ticket: T323
Status: implemented at bounded root-roster scope

## Official source findings

Ikemen-GO evaluates perfect and clutch with a team loop. The winning side's
members are read from source character slots, and the check fails if any
participating member lacks the required life state. Perfect runs first;
clutch uses the configured threshold only after perfect fails.

## Port slice

The round finish contract now accepts normalized participants. Tag and Turns
closures build that list from the current character roots, map source sides
1/2 to runtime sides 0/1, and carry current life plus `lifeMax`. The resolver
uses every member on the winning side when the list is present. Single mode
keeps the active-pair path.

The bridge intentionally does not add helpers or invent `teamside` state.
Those facts need their own source-backed ownership decision before they can
affect a FightScreen result.

## Evidence

- Runtime coverage blocks perfect when a winning teammate has lost life.
- Runtime coverage allows clutch only when every winning teammate is within
  the threshold.
- Match-round coverage proves the roster reaches the round decision.
- Focused result: 3 files / 48 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is root-roster aggregation for existing Tag/Turns runtime routes. Exact
source slot admission, helpers, team KO arbitration, cause-specific win types,
browser screenpack proof, and full MUGEN/IKEMEN compatibility remain open.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
