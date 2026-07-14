# Research: Red-life HUD Presentation

## Question

How should the bounded red-life value already owned by the runtime be exposed
to the playable HUD without conflating it with current life or claiming exact
screenpack parity?

## Official boundary

IKEMEN keeps red-life as a distinct character resource, clears it when life
reaches zero, and bounds positive values against the current-life/life-max
interval in the character runtime:
[char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).
The match-level team sharing flag remains owned by the system configuration:
[system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1).

## Decision

The port presents red-life as a secondary recoverable-life meter below the
current-life meter. Solo HUD actors read the actor runtime value. Team HUD
slots read the same normalized `redLife` and `redLifeRatio` emitted by
`RuntimeTeamRoundLifebar/v0`, so standby and active-root replacement keep one
presentation contract. Empty values remain structurally present with an
accessible value and an explicit actor/slot binding.

## Evidence

`RuntimeTeamRoundLifebarSystem` tests cover normalized positive, negative, and
over-max values. Browser smoke passes desktop/mobile actor bars and desktop/
mobile Tag slot bindings, with nonblank runtime and Studio evidence in
`.scratch/qa/qa-smoke-redlife-hud/diagnostics.json`. TypeScript 7 typecheck,
production build, trace corpus (597/597), architecture boundaries, and CSS
budget pass.

## Blocked

Exact screenpack/motif layout, animated red-life recovery, palette/theme
ownership, round persistence, rollback/netplay, native HUD triggers, and full
MUGEN/IKEMEN presentation parity remain separate gates.
