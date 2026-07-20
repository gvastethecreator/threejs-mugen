# FightScreen winType derivation

Date: 2026-07-20
Ticket: T322
Status: implemented at bounded active-pair scope

## Official source findings

At round end, Ikemen-GO checks the winning team after it has selected a
winner. `checkPerfect` rejects perfect when any participating member has lost
life. If perfect does not apply, `checkClutch` compares each member with
`lifeMax * clutch.threshold / 100`. The default `clutch.threshold` is 10.
The source applies the same upgrade order to KO and time-over decisions.

The source's `WinType` keeps the earlier cause record while the perfect or
clutch record is added. This means a base special record can accompany an
upgraded perfect or clutch record. The local runtime retains the normal base
fallback when the cause is not available.

## Port slice

`fight.def` now loads `clutch.threshold`. Imported timing carries the value
into the outcome decision, where it is bounded to 0-100 and defaults to 10.
The active p1/p2 round bridge forwards `lifeMax`, and the winner selection
derives perfect before clutch. Callers can retain a known base type through
`winTypeBase`; a non-upgraded base `winType` also remains available for the
upgrade composition.

## Evidence

- Loader coverage proves `clutch.threshold = 10` reaches typed system timing.
- Runtime coverage proves perfect precedence, a configurable clutch ratio,
  base special composition, and no inferred type without `lifeMax` evidence.
- Match-round coverage proves the active bridge forwards `lifeMax`.
- Focused result: 3 files / 46 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is an active-pair decision slice. Team-wide source checks, Turns/Tag
participant aggregation, combat-cause classification, direct screenpack
browser proof, and full MUGEN/IKEMEN compatibility remain open.

## Source links

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
