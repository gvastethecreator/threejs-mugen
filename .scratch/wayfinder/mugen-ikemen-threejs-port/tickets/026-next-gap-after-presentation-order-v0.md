# Choose next gap after PresentationOrder v0

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded package should follow semantic stage/player/effect order while maximizing playable sandbox, Studio authoring, and full-port progress?

## Candidate Inputs

- Equal-priority and Explod `ontop` reference behavior with deterministic overlap fixtures.
- First Studio source identity, write, reload, and playtest transaction.
- `MatchTickSchedule/v0` diagnostics before deeper ownership/order changes.
- Common1 state-source precedence or hard guard-phase order.
- Package-level IKEMEN scanner entry with presentation profile provenance.

## Answer

Select `MatchTickSchedule/v0` before changing Common1, guard, controller, movement, animation, or combat order.

Elecbyte defines per-player CNS state/controller order but does not provide a complete global subsystem schedule. The official IKEMEN GO overview establishes a compatibility target, not a normative cross-engine tick schedule. Repo inspection shows the current active route advances kinematics, animation, and controllers per fighter before post-fighter combat and presentation effects.

The bounded package therefore records actual active/pause/hitpause callbacks, five critical semantic stamps, actor identity, owner, mutable stores, and side effects. It persists diagnostics through snapshots, runtime traces, trace artifacts, `qa:trace`, and the browser bridge while excluding them from legacy behavior checksums. Current controller/movement and animation/combat differences from the roadmap target are visible known divergences, not parity claims or failures.

Next route: Common1 character override versus `stcommon` source precedence for state 120, without changing guard timing.
