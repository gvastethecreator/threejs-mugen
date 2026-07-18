# Research: RuntimeRoundPhase/v0

Date: 2026-07-18
Ticket: [T271](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/271-runtime-round-phase.md)

## Question

What phase values and event boundaries must replace the current constant
`RoundState = 2` read without claiming complete round choreography?

## Primary sources

- [Elecbyte MUGEN 1.1 Trigger Reference: RoundState](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines `0` pre-intro, `1` intro, `2` fight, `3` pre-over, and `4` over.
- [Elecbyte MUGEN 1.1 Trigger Reference: MatchOver](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  describes MatchOver as a separate match-level trigger whose exact timing is
  tied to win poses in the documented engine behavior.
- [Pinned IKEMEN-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
  remains the repository's source authority for the round loop; this slice
  does not infer exact upstream timing from the local implementation.

## Local findings

- `src/mugen/runtime/ExpressionEvaluator.ts` returned `2` unconditionally for
  `RoundState`.
- `RuntimeRoundSystem` has separate string states `fight`, `ko`, and
  `timeover`, plus a bounded post-round window, but no typed phase.
- `RuntimeMatchOutcomeSystem` owns match score/terminal outcome, while
  `RuntimeRoundContextSystem` owns round number and per-actor history. Those
  owners must remain separate from phase.

## Decision

Add `RuntimeRoundPhase/v0` as a small named-event state machine. The current
runtime starts directly at phase `2` to preserve existing gameplay behavior.
Its real lifecycle maps finish to phase `3` and post-round completion to phase
`4`; reset and next-round return to phase `2`. The phase world still exposes
the official `0 -> 1 -> 2` startup transitions for future intro ownership,
with invalid jumps rejected. Actor runtime state carries the current phase so
the expression evaluator can read it; actors lacking the optional metadata
retain fallback `2`.

## Uncertainty and claim ceiling

This proves a typed local phase boundary, not exact MUGEN/IKEMEN timing. Intro
screens, winpose/motif controllers, Common1/ZSS execution, MatchOver timing,
Turns transaction order, and rollback/netplay remain open.

## Next action

Use the phase boundary as an input to the next round-choreography slice; do not
promote phase `0/1` to live gameplay until intro/motif ownership has a source-
backed execution contract.
