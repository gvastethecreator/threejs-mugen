# Research: FightScreen round intro timing

Date: 2026-07-18
Ticket: Wayfinder 286

## Question

What is the smallest source-backed round-start boundary after the T285 fade-in
adapter, and which state must own it before announcement, skip, and character
intro work is attempted?

## Source findings

The pinned Ikemen-GO `FightScreenRound` owns `start_waittime` and `ctrl_time`.
On reset, the system initializes `sys.intro` to
`start_waittime + ctrl_time + 1`. The system decreases that countdown before
the live-round timer is advanced. The source round-state mapping distinguishes
pre-intro (`0`), intro (`1`), fight (`2`), pre-over (`3`), and over (`4`).

The source `act` path separately advances fades and Fight/Round presentation.
The same source file owns `shutterTimer`, `shutter_time`, announcement phases,
and skip signals. Those responsibilities are deliberately not folded into
this slice. The official MUGEN trigger reference also documents the observable
round-state values, which supports keeping the phase contract visible to the
runtime rather than hiding it in the renderer.

## Decision

T286 maps only the explicit `[Round] start.waittime` and `ctrl.time` values.
The normalized runtime keeps a source-shaped remaining counter and exposes
`RuntimeRoundIntro/v0` inside `RuntimePreRound/v0`. It enters `pre-intro` when
the imported boundary is active, changes to `intro` at the control threshold,
and reaches `fight` at zero. The round timer and finish decision remain held
until that transition. When both fields are absent, the existing immediate
fight path remains the default for compatibility with the current local demo
and synthetic fixtures.

## Deferred boundaries

Announcement assets, `shutter.time`/`shutter.col`, skip input, `RoundNoSkip`,
dialogue, character intro reset/control semantics, exact tick order around
Fight, Common1/ZSS, motif/localcoord, teams/Turns, rollback/netplay, and full
MUGEN/IKEMEN parity require independent evidence gates.

## Sources

- Ikemen-GO pinned source:
  https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- Ikemen-GO pinned system loop:
  https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268
- M.U.G.E.N trigger reference:
  https://elecbyte.com/mugendocs-11b1/trigger.html
