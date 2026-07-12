# Model Active-root Phase Capabilities

Type: task
Status: resolved
Blocked by: None

## Question

Can explicit IKEMEN matches publish one versioned per-root, per-phase capability contract that reflects current ownership and live team state without turning structural activation into broad gameplay participation?

## Acceptance

- Add a versioned diagnostic that separates command routing, controller CNS, direct input, AI, kinematics, animation, effects, combat, round, presentation, and resource capabilities.
- Derive root identity and live disabled/standby/player-type state from existing authoritative owners; do not parse actor ids or duplicate team-state mutation.
- Represent current truth exactly: P1/P2 retain existing playable consumers; P3-P8 retain mapped Tag commands plus bounded controller-only CNS and no later gameplay consumers.
- Keep capability declaration separate from scheduling/execution so this ticket changes no fighter behavior, renderer output, effect ownership, round flow, or scores.
- Fail closed for invalid/non-player roots and preserve legacy/unknown/Single behavior.
- Cover reset, standby transitions, Tag/Single modes, diagnostic isolation, and consistency with `RuntimeRootParticipation/v0` and `RuntimeRootInputRouting/v0`.
- Run focused tests, full tests, TypeScript 7 typecheck/build, `pnpm qa:trace`, boundaries, and diff check. Browser smoke is N/A unless a visible consumer changes.

## Answer

Explicit IKEMEN `MatchWorld` registries now publish `RuntimeRootPhaseCapabilities/v0`, reconciling live team state with `RuntimeRootParticipation/v0` and `RuntimeRootInputRouting/v0`. The matrix distinguishes commands, bounded/playable CNS, direct input, AI, kinematics, animation, effects, combat, round, presentation, and resources without changing execution.

P1/P2 retain current owners; Tag P3-P8 expose mapped commands plus bounded reserve CNS only; Single reserves keep command mapping disabled; legacy/unknown registries expose no schema. Disabled/non-player/invalid-side roots fail closed, source-diagnostic drift throws before partial publication, standby/reset and P2 AI/direct transitions are covered, and returned registries remain isolated. Full evidence: `docs/reports/2026-07-11-ikemen-active-root-phase-capabilities.md`.
