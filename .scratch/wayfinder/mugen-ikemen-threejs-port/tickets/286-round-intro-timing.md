# Wayfinder 286 - FightScreen round intro timing

Status: resolved bounded implementation
Date: 2026-07-18
Implementation: `e978fa3c`

## Contract

- Parse `[Round] start.waittime` and `ctrl.time` from imported `fight.def`.
- Preserve the source countdown shape `start.waittime + ctrl.time + 1`.
- Publish `RuntimeRoundIntro/v0` inside the reset-owned `RuntimePreRound/v0`
  snapshot with phase, frame, remaining, and normalized source durations.
- Transition the runtime through `pre-intro`, `intro`, and `fight`.
- Hold the round timer and terminal finish decision until `fight` is reached.
- Keep the legacy route unchanged when neither source field is declared.

## Evidence

- Focused loader/runtime/round integration: 3 files, 289 tests passed.
- Full checkpoint: TypeScript 7.0.2, 233 files / 2480 tests, Vite build with
  316 modules, 633/633 trace artifacts, repository/redirect boundaries, CSS
  budget, and 64 browser capture paths with 0 console issues and 0 page errors
  in `.scratch/qa/qa-smoke-t286-full/diagnostics.json`.
- Code commit: `e978fa3c`.
- Source authority: pinned Ikemen-GO `fightscreen.go` and local checkout
  `.scratch/external/Ikemen-GO/src/fightscreen.go`.

## Claim ceiling

This closes only the imported round-intro timing boundary. It does not claim
Fight/Round announcement rendering, `shutter.time` or `shutter.col`, intro
skip, `RoundNoSkip`, dialogue, character intro state reset, external input
gating, exact Common1/ZSS scheduling, localcoord/motif transforms, teams,
Turns, rollback/netplay, or full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268
- https://elecbyte.com/mugendocs-11b1/trigger.html
