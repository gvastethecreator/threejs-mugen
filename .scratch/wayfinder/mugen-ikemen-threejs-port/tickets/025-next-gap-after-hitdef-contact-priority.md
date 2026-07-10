# Choose next gap after HitDef contact priority

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded package should follow accepted-contact HitDef sprite priorities while maximizing visible sandbox, Studio, and full-port progress?

## Candidate Inputs

- Renderer-independent semantic presentation-order key plus controlled player/effect/stage overlap.
- `MatchTickSchedule/v0` diagnostics before ownership/order changes.
- First source-identity/write/reimport Studio transaction.
- Common1 state-source precedence or hard guard-phase order.
- Package-level IKEMEN scanner entry.

## Answer

Select the renderer-independent semantic presentation-order package. Elecbyte requires stage layer 0 behind characters, layer 1 in front, DEF order within each layer, and higher sprite priority on top. Three.js r184 separates opaque/transparent queues and gives group order precedence over object render order, so isolated z values and magic render-order bands cannot prove the full chain.

Implement `MugenPresentationOrder/v0` as a runtime-owned key plus a separate Three.js adapter. Migrate stage layers, actor shadows/actors, hit sparks, collision debug, pause, and EnvColor to the shared vocabulary; require desktop/mobile diagnostics plus controlled WebGL pixels for stage-back < shadow < actor < effect < stage-front. Keep exact package profile propagation, equal ties, Explod `ontop`, L4/L5 parity, and score movement blocked.

Research: `docs/research/2026-07-10-semantic-presentation-order.md`.
