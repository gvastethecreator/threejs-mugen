# Map Code Fu Man Upper Route

Type: research
Status: resolved
Blocked by: None

## Question

Can one additional authored Code Fu Man command route prove a bounded upper
attack without conflating command breadth with complete special or MUGEN parity?

## Inputs

- `.scratch/fixtures/codefuman.zip`
- `kfm.cmd` authored `upper_x` command and State -1 route.
- `kfm.cns` authored state `1100` and AIR action `1100`.
- Existing imported trace gate and browser input harness.

## Acceptance

- Identify the exact command, State -1 value, state, animation, and authored
  controller/contact route.
- Define a trace gate independent from the normal `x` and QCF routes.
- Preserve optional-fixture behavior, source provenance, and claim ceiling.
- Add browser evidence only if the physical input route can be isolated without
  weakening the existing QCF gate.

## Claim Ceiling

Allowed: one independently sourced Code Fu Man upper-route command/state path.

Blocked: all specials, command-priority parity, complete AIR/Width semantics,
exact Common1 timing, broad controller parity, public asset bundling, and full
MUGEN/IKEMEN parity.

## Resolution

Selected the authored `upper_x` route from `kfm.cmd`: `~F, D, DF, x` routes
through State -1 `Light Kung Fu Upper` to state `1100`. The imported `kfm.cns`
state publishes AIR action `1100`, executes authored `Width` controllers, and
contains two `HitDef` branches. The optional production trace
`codefuman-independent-upper-x` passes with checksum `f26de55f`, 31 frames,
and final checksum `392e1dbb`; browser smoke proves physical input, nonblank
Three.js output, and idle return. Details are recorded in
`docs/reports/2026-07-13-codefuman-upper-route.md`.

Next: Wayfinder 003 defines the practical Studio editor authoring spine.
