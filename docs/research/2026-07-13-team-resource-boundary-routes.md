# Research - Team resource boundary routes

Date: 2026-07-13
Status: source-backed integration boundary

## Question

Which imported controller routes must be exercised before the bounded
`RuntimeTeamResourceBank/v1` claim is credible?

## Primary evidence

- The official [IKEMEN-GO Screenpack features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Screenpack-features)
  lists `teamlifeshare` and `teampowershare` as independent options.
- The official [IKEMEN-GO Lifebar features reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Lifebar-features)
  keeps life and power as player-scoped values, so a shared bank must still
  project deterministic values to each represented root.
- The official [MUGEN State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  documents `SuperPause`, `TargetLifeAdd`, and `TargetPowerAdd` as distinct
  controller surfaces; they cannot be represented by one generic test only.
- The official [IKEMEN-GO miscellaneous reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  documents player/team mode inputs that keep actor values and team policy
  separate.

## Decision

Promote two required imported Tag traces:

1. `SuperPause.poweradd` with only `teamPowerShare` enabled. P1 reaches power
   `100`, standby P3 mirrors `100`, and life remains root-local.
2. `TargetLifeAdd` plus `TargetPowerAdd` with only `teamLifeShare` enabled.
   P2 reaches life `943` / power `40`, standby P4 mirrors life `943`, and P4
   keeps power `0`.

Both use the existing post-tick delta reconciliation boundary. This isolates
policy switches and proves controller/target/Pause paths converge on the same
owner model without adding a new scheduler phase.

## Local evidence

- `RuntimeTraceGatePresets` creates the two public presets.
- `RuntimeTraceGatePresets.test.ts` asserts bank ids, owner ids, maxima,
  standby values, and independent share flags.
- `scripts/qa_traces.cjs` promotes both artifacts to required coverage.
- Checksums: `31f427d5` (`SuperPause`) and `22c7d56a` (`Target`).

## Uncertainty

The public references establish the independent options and controller
surfaces, but not exact IKEMEN simultaneous-write ordering, shared-bank
initialization, red-life/guard/stun sharing, or helper/projectile ownership.
The traces therefore support an exercised compatibility slice, not full parity.
