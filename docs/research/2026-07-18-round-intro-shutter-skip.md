# Research: FightScreen intro shutter skip

- Date: 2026-07-18
- Entry: 561 / T287
- Status: Resolved bounded slice

## Question

Can the source shutter and intro-skip boundary be ported without claiming the
character reset and announcement choreography owned by adjacent FightScreen
paths?

## Sources

- [Ikemen-GO fightscreen.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go)
- [Ikemen-GO system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
- [Elecbyte MUGEN trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html)
- Local pinned checkout: `.scratch/external/Ikemen-GO/src/fightscreen.go`
  and `.scratch/external/Ikemen-GO/src/system.go`

## Findings

1. `shutter.time` is a half-cycle. The source shutter duration is `2T`.
2. The shutter countdown is presentation-owned: `2T` is open, `T` is closed,
   and `0` is open again.
3. Intro skip is edge-triggered. A held hard button must not repeatedly start
   the shutter.
4. `roundnotskip` rejects the request and a request at or after `ctrl.time` is
   too late.
5. The source changes the intro boundary to the control-time boundary, then
   performs character asset/position/state reset in a separate operation.
6. Announcement and round/fight display suppression have separate source
   ownership and should not be hidden inside the shutter adapter.

## Local adaptation

The implementation carries `shutter.time`/`shutter.col` through the loader and
runtime timing contract, observes new hard-button edges for both seats, applies
the bounded raw `roundnotskip` guard, publishes `RuntimeRoundShutter/v0`, and
renders two symmetric Three.js bars. The raw guard is intentionally local to
the skip request; it does not widen the global AssertSpecial snapshot API.

## Evidence and claim ceiling

T287 passes the focused 4-file / 300-test gate, the 233-file / 2484-test full
suite, TypeScript 7.0.2, Vite build, 633/633 traces, repository and redirect
boundaries, CSS budget, and 64-path desktop/mobile browser smoke with zero
console or page errors. This evidence does not prove character reset,
announcement/display choreography, dialogue, Common1/ZSS, screenpack
transforms, teams/Turns, rollback/netplay, or full parity. Scores remain
65 / 36 / 20 / 10-12 / 6-8 / 25.

## Decision

Close T287 at the bounded shutter/skip contract. The next research-first slice
should choose announcement/display ownership or an independent character
control/reset boundary, with separate source and browser evidence.
