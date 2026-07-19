# Research: Imported fight-screen timing source

Date: 2026-07-18  
Ticket: [T277](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/277-imported-fight-screen-timing.md)

## Question

Where can imported `fight.def` timing enter the runtime without bypassing the
existing timing authority or pretending to implement full screenpack flow?

## Primary sources

- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174): the `[Round]`-equivalent defaults include `over.waittime`, `over.hittime`, `over.wintime`, `over.forcewintime`, `over.time`, and the slowdown values.
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683): round phase `4` begins after `over.waittime`.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268): win-pose readiness and reserved state entry are separate from the initial over wait.

## Local findings

- `MugenSystemAssetsLoader` already resolved `fight.def` for FightFX, making it
  the correct source boundary for the `[Round]` section.
- Imported fighters already carry system-derived metadata into the playable
  runtime; adding a typed `MugenFightScreenTiming` record keeps source path and
  values available without coupling model parsing to runtime normalization.
- `RuntimeRoundTiming` is the sole runtime authority. The adapter maps
  `over.waittime` to phase-4 opening, `over.wintime` to readiness, and
  `over.time` plus waittime to the terminal post-KO window. `over.hittime` and
  `over.forcewintime` remain recorded but unused.

## Decision

Parse and preserve the numeric `[Round]` values at system-asset load time,
carry them through the imported fighter definition, and let
`PlayableMatchRuntime` choose explicit options first, then P1/P2 imported
source timing, then the existing defaults. This keeps source provenance and
runtime timing ownership separate.

## Claim ceiling

This is imported timing provenance and bounded mapping only. It does not claim
screenpack rendering, parsed match-end release, exact `over.forcewintime` or
`over.hittime` semantics, Common1/ZSS, motif/fade choreography, or full
MUGEN/IKEMEN parity.

## Verification

- Implementation commit: `93e1429a`.
- Focused loader/import/runtime tests passed (`4` tests).
- Broad proof passed: `233` test files / `2459` tests, production build,
  boundaries, redirect boundary, and `633/633` trace artifacts. Default
  checksums remained unchanged.
