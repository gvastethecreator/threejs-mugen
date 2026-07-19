# Wayfinder T287 - FightScreen intro shutter skip

- Entry: 561
- Status: Resolved at bounded scope
- Code commit: `4d615c8f`
- Area: R1 runtime compatibility / FightScreen

## Objective

Port the source-backed FightScreen intro skip boundary without folding
character reset, announcement choreography, or full FightScreen parity into a
single untestable claim.

## Source contract

- `shutter.time` is the half-cycle duration; the visible shutter lasts `2T`.
- A new hard-button edge can request the skip. A held button must not restart
  the shutter.
- `roundnotskip` rejects the request, and a request after the control window is
  too late.
- The source reduces the remaining intro to the control-time boundary and
  separately resets character assets, positions, and state.
- Shutter presentation counts down from open at `2T`, closes at `T`, and opens
  at `0`.

Primary sources:

- [Ikemen-GO fightscreen.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go)
- [Ikemen-GO system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
- [Elecbyte MUGEN trigger reference](https://elecbyte.com/mugendocs-11b1/trigger.html)

## Implementation

- Parse `shutter.time` and `shutter.col` in the system-assets loader.
- Carry them through `RuntimeRoundTiming` and `PlayableMatchRuntime`.
- Detect new `a,b,c,x,y,z` hard-button edges for both seats.
- Apply a bounded raw `roundnotskip` guard without expanding the global
  `AssertSpecial` snapshot contract.
- Publish active `RuntimeRoundShutter/v0` metadata inside `RuntimePreRound/v0`.
- Render symmetric top and bottom Three.js bars with source-shaped timing,
  color, and presentation order.

## Evidence

- Focused loader/runtime/renderer gate: 4 files / 300 tests.
- Full suite: 233 files / 2484 tests.
- TypeScript 7.0.2 typecheck passed.
- Vite build passed with 317 transformed modules; the existing large-chunk
  warning remains non-blocking.
- `qa:trace`: 633/633 artifacts, 599 required and 34 optional.
- Repository boundaries, redirect boundary, and CSS budget passed.
- Browser smoke passed in `.scratch/qa/qa-smoke-t287-full/diagnostics.json`:
  64 capture paths, desktop/mobile Runtime and Studio, 0 console issues and 0
  page errors.

## Claim ceiling

This closes only the shutter timing/rendering and bounded intro-skip request.
It does not claim upstream character asset/position/state reset, exact
announcement or `skiprounddisplay`/`skipfightdisplay` choreography, dialogue,
Common1/ZSS, motif/localcoord transforms, teams/Turns, rollback/netplay, or
full MUGEN/IKEMEN parity. Compatibility scores remain unchanged.

## Next gate

Research an independent FightScreen announcement/display ownership slice or
the character control/reset boundary. Keep those contracts separate from the
shutter renderer and from the global input snapshot contract.
