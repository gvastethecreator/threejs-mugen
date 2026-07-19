# ADR 0052: Bounded FightScreen intro shutter skip

- Status: Accepted for bounded implementation
- Date: 2026-07-18
- Entry: 561 / T287
- Code: `4d615c8f`

## Context

The preceding round-intro slice ports `start.waittime` and `ctrl.time` as a
reset-owned `RuntimeRoundIntro/v0` countdown. Ikemen-GO adds a separate shutter
and input-driven skip path. Combining that path with character reset or
announcement display would make the compatibility claim ambiguous and hard to
audit.

## Decision

Keep shutter skip as a small bridge across four owners:

1. system-assets loading parses `shutter.time` and `shutter.col`;
2. `RuntimeRoundTiming` owns normalized duration and color;
3. `PlayableMatchRuntime` owns button-edge detection, the bounded raw
   `roundnotskip` guard, and the intro boundary update;
4. `RoundShutterRenderer` consumes `RuntimeRoundShutter/v0` and renders the
   symmetric top/bottom bars.

The shutter uses `2T` frames, does not restart on held input, and remains
presentation order 4. Skip requests are rejected when the round is marked
`roundnotskip` or when the intro is already at the control boundary.

## Rejected alternatives

- Put the skip in the renderer: rejected because input and round ownership
  would become presentation-dependent.
- Expand the global AssertSpecial snapshot first: rejected because this slice
  needs only a narrow source guard and the wider contract has its own gate.
- Reset character assets, position, and state in the same change: rejected
  because the upstream operation is a distinct behavior with separate evidence
  requirements.

## Consequences

The project now has a source-shaped, testable shutter presentation and an
edge-triggered bounded skip seam. It does not claim exact announcement,
round/fight display suppression, character reset, dialogue, Common1/ZSS,
teams/Turns, rollback/netplay, or full MUGEN/IKEMEN parity. Scores remain
unchanged.

## Verification

Focused 4 files / 300 tests, full 233 files / 2484 tests, TypeScript 7.0.2,
Vite 317-module build, 633/633 trace artifacts, boundaries, CSS budget, and
64 browser capture paths with zero console/page errors passed.
