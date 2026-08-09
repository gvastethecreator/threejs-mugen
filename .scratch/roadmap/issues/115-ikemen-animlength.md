# Issue 115 — Ikemen `AnimLength` action-cursor read

- Status: `closed-bounded`
- Lane: `R2 animation/runtime reads`
- Priority: `P1`

## Objective

Compare the official Ikemen `AnimLength` trigger with imported AIR action
durations and decide whether a bounded total-length read can share the current
animation cursor without claiming loop or alternate-action parity.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and the current `RuntimeAnimationSystem`. Keep the source distinction between
total authored/effective action duration and live playback time explicit.

## Candidate fixture

- Two AIR actions with different frame counts, loop starts, and zero/negative
  authored durations.
- Expression reads before and after an action change and at the final frame.
- Testbench displays the value as read-only action metadata if the contract is
  accepted.

## Delivered slice

- `runtimeAnimationLength(action)` sums the effective AIR frame durations from
  the imported action. It reuses the existing runtime rule
  `max(1, duration)`, so zero and negative authored durations are bounded to
  one tick.
- `AnimLength` is available as a typed identifier through the shared
  `ExpressionContext`, the active actor context, and controller expressions.
  The value follows the actor's current action without moving cursor ownership
  into the evaluator.
- The read-only Animation Testbench displays the selected action's total in
  ticks next to the active-frame `AnimElemVar` metadata.
- Focused coverage: 5 files / 78 tests passed. `pnpm typecheck` passed, and
  `pnpm qa:browser:fighter-lab` passed with `AnimLength` and `AnimElemVar`
  assertions, WebGL rendering, and zero page/console errors.
- Final gates: `pnpm build` passed (359 modules), `pnpm check:boundaries`
  passed, `pnpm qa:trace` passed at 686/686 (652 required / 34 optional), and
  `git diff --check` passed with only existing CRLF normalization warnings.
- The inherited full-suite baseline remains documented: 13 failed files / 58
  failed tests / 3348 passed (3406 total), concentrated in retired roster
  fixtures, old Studio expectations, and legacy imported-runtime labels.

## Claim ceiling

Do not claim full AIR loop/alternate-action semantics, action-owner redirection,
Helper animation ownership, raw negative/infinite duration fidelity,
rollback/netplay serialization, or complete M.U.G.E.N/Ikemen animation parity
from this slice.

## Next cut

Queue T542 / [issue 116](116-ikemen-animplayerno.md) to compare the official
`AnimPlayerNo` owner read with the current action source/ownership model.
