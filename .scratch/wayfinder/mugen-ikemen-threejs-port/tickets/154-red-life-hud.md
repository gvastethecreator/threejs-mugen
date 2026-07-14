# Wayfinder Ticket 154: Present Red-life HUD Bars

## Status

Completed as Entry 515 on 2026-07-14.

## Decision

Expose runtime-owned red-life as a secondary recoverable-life meter for normal
fighters and IKEMEN team lifebar slots. Keep current life and recoverable life
separate, preserve actor/slot identity, and align right-side meters from the
right edge.

## Implementation

- `RuntimeTeamRoundLifebar/v0` now emits normalized `redLife` and
  `redLifeRatio` per slot.
- `PlayableMatchRuntime` forwards root red-life into the team lifebar actor
  projection.
- `App.renderRoundHud` renders solo and team `hud-redlife` meters with stable
  ids, visibility state, and accessible values.
- Browser smoke asserts actor and Tag-slot bindings in desktop/mobile routes.

## Evidence

- Focused lifebar and match tests: 17/17.
- TypeScript 7 typecheck, build, 597/597 trace artifacts, boundaries, CSS
  budget, and Playwright smoke: green.
- Evidence directory: `.scratch/qa/qa-smoke-redlife-hud/`.

## Claim Ceiling

This is bounded runtime-owned presentation. Exact screenpack/motif layout,
animated recovery, round persistence, native HUD triggers, rollback/netplay,
and full MUGEN/IKEMEN parity remain future work.
