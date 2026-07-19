# ADR 0051: Source-backed round intro timing boundary

- Status: Accepted bounded slice
- Date: 2026-07-18
- Implementation: `e978fa3c`

## Context

The runtime already exposed the five round phases but started every round in
`fight`. T285 added imported FightScreen fade-in presentation without owning
the source countdown that precedes the live round. Ikemen-GO resets its intro
counter from `start.waittime + ctrl.time + 1`, advances the counter before the
round timer, and exposes pre-intro, intro, and fight states.

## Decision

Parse only the explicit imported `[Round] start.waittime` and `ctrl.time`
values. Normalize them into `RuntimeRoundTiming`, reset a dedicated remaining
counter, expose `RuntimeRoundIntro/v0` in `RuntimePreRound/v0`, and transition
the existing `RuntimeRoundPhaseWorld` at the source thresholds. Keep the
legacy immediate-fight default when the imported fields are absent.

## Consequences

- Imported round timing can now hold the live timer until the fight boundary.
- Round snapshots expose deterministic intro evidence for Studio and trace
  consumers without coupling the parser to a renderer.
- Fade-in and intro timing remain separate subcontracts inside pre-round state.
- Announcement assets, shutter/skip, character control/reset, and exact
  Common1/ZSS scheduling remain independent work.

## Evidence

Focused loader/runtime/round integration passes 289 tests. The full checkpoint
also passes TypeScript 7.0.2, 233 files / 2480 tests, Vite 316 modules,
633/633 trace artifacts, repository/redirect boundaries, CSS budget, and 64
browser capture paths with 0 console issues and 0 page errors. Source
references:

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268
- https://elecbyte.com/mugendocs-11b1/trigger.html
