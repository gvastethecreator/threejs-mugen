# Map Active-root Playable Phase Promotion

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest source-backed phase promotion that can move one live non-standby reserve beyond bounded CNS without granting effects, combat, round, presentation, or resources prematurely?

## Acceptance

- Pin the upstream character-update ordering relevant to control, state controllers, kinematics, animation, effects, and standby filtering.
- Map the local `advanceFighter` and paused-branch owners against `RuntimeRootPhaseCapabilities/v0`.
- Identify every hidden side effect of promoting controller profile, kinematics, or animation for P3-P8, including effect-store aliasing and pair-owned opponent/combat assumptions.
- Select one implementation-ready phase cut with explicit allowed/blocked claims, reset behavior, trace/browser requirements, and deletion criteria.
- Update Wayfinder, roadmap, workplan, progress, backlog, and the I2 issue. Do not change executable behavior or scores in this research ticket.

## Answer

The smallest safe promotion is a normal-tick `active-motion` phase: precompute root participation before actor execution, then run restricted motion CNS, kinematics, and animation for available non-standby P3-P8 roots. Do not call full `advanceFighter`; it mixes effects, hit/contact/recovery, unrestricted controllers, and pair-owned constraints. Keep direct input/AI, paused branches, effects, combat, round, presentation, audio, HUD, and resources unchanged. Wayfinder 097 owns implementation and required trace proof. Full reasoning, source links, hidden-side-effect audit, reset policy, and deletion criteria live in `docs/research/2026-07-11-ikemen-active-root-playable-phase-promotion.md`.
