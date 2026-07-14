# Research: BGCtrl Enabled animation clock

## Question

When an imported stage uses `Enabled = 0` on an action-backed background, which
clock should advance while the layer is disabled?

## Primary source

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)

The official background controller reference distinguishes `Visible` from
`Enabled`: invisible elements keep time, while disabled elements are invisible
and their animation time does not advance.

## Decision

Keep the stage/background clock as the authoritative round clock, but attach a
runtime-only `animationTick` to the resolved layer when targeted `Enabled`
controllers exist. The bounded resolver counts ticks in which the layer is
enabled and the renderer uses that count for action-frame selection. `Visible`
continues to use the global background clock.

## Evidence

- `src/tests/stageProjection.test.ts` proves enabled ticks `0..1`, a disabled
  interval `2..3`, and resumed animation tick `3` at global tick `4`.
- `AxisRenderer` consumes the resolved animation clock for stage actions.
- Focal command: `pnpm vitest run src/tests/stageProjection.test.ts` passed
  1 file / 12 tests.

## Claim ceiling

Allowed: bounded action-clock pause for resolved stage layers controlled by
`Enabled`.

Still blocked: exact mutable controller state history, multi-group controller
ordering under pause, zoom/windowdelta/mask semantics, and full stage parity.
