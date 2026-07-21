# Helper Width/Height constraints research

Date: 2026-07-21

## Question

Which local Helper Width/Height behavior can join current PlayerPush without
claiming the complete IKEMEN controller and actor-order model?

## Sources

- MUGEN 1.1 local reference:
  `.scratch/external/mugen-1.1b1/docs/sctrls.html`, `Width` section.
- Ikemen-GO pinned source `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`:
  `src/compiler_functions.go:2575` and `:6296`; `src/bytecode.go:9484` and
  `:14439`.

## Findings

- MUGEN documents `Width` as a temporary one-tick change to player push width.
  `player` controls player contact width; `value` also carries edge-width
  behavior.
- Ikemen-GO compiles and executes Width `edge`, `player`, and `value`.
  `player` and `value` change player width, while `value` also changes edge
  width. Its Height controller applies the authored value pair. Both support
  redirected destinations with caller-to-destination coordinate scaling.
- This port already has a shared one-frame constraint model for root
  Width/Height and composes those deltas into the current group-3 size box.
  Helpers do not yet enter that model, so T364 PlayerPush uses base Helper
  dimensions even when a Helper authors either controller.

## Decision

T365 should reuse the existing constraint model for local Helper
`Width player|value` and `Height value`, with static or dynamic expressions.
It must reset the deltas before Helper State -4/current-state execution and
write them through the existing Helper state adapter. The existing T364
participant projection then observes them without a second push geometry
implementation.

## Deliberate limits

Do not add edge-width behavior, RedirectID, Helper depth, nested Helper trees,
size proxies, exact CharList pair order, browser output, upstream differential
evidence, score movement, or full MUGEN/IKEMEN parity in this task.

## Result

Implemented in `5351a0ac`. Current Helpers reset owned one-frame Width and
Height state before State -4, apply local static or dynamic
`Width player|value` and `Height value`, retain that state through runtime
adapters and snapshots, and feed current size/body-push projection. The
player-size part of Width `value` is covered; its source edge component is
not.

The combined T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7, `qa:trace` `636/636` artifacts, build with `329` modules,
both boundary guards, and diff hygiene. Full Vitest and browser smoke remain
deferred.
