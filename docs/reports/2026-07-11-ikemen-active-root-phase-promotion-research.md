# IKEMEN Active-root Phase Promotion Research Report

Date: 2026-07-11
Scope: Wayfinder 096
Compatibility profile: explicit `ikemen-go`

## Result

- Pinned command, actor action, controller, position, animation, finish, update, effective-control, and standby-hit-filter order at Ikemen-GO revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Audited the local normal and paused branches against `RuntimeRootPhaseCapabilities/v0`.
- Rejected reuse of full `advanceFighter`: it mixes movement with effects, hit/contact/recovery owners, unrestricted CNS, and constraints.
- Selected a normal-tick `active-motion` phase for Wayfinder 097: restricted motion CNS, kinematics, and animation only, behind a precomputed root-phase snapshot.
- Direct input/AI, Pause/hitpause widening, effects, combat, round, presentation, audio, HUD, and resources remain blocked.

## Evidence

- Primary source: [Ikemen-GO character action order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L12150) and [character-list ordering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13176).
- Local source audit: `PlayableMatchRuntime`, `RuntimeFighterAdvanceWorld`, `RuntimeRootCnsExecutionWorld`, `RuntimeKinematicsWorld`, `RuntimeAnimationWorld`, and pair-owned post-fighter/effect paths.
- Research artifact: [`docs/research/2026-07-11-ikemen-active-root-playable-phase-promotion.md`](../research/2026-07-11-ikemen-active-root-playable-phase-promotion.md).
- Verification: pinned-source review, local owner reconciliation, adversarial side-effect audit, roadmap reconciliation, and `git diff --check`.
- Runtime/build/trace/browser gates: N/A for this docs-only checkpoint. The declared 172 files / 1769 tests and 540/540 traces remain prior implementation evidence, not re-run evidence.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 096 acceptance

Verification state: verified as research/documentation

Independent review: unavailable; internal adversary, invariant, simplifier, and source-reconciliation passes completed

Claim allowed: one bounded `active-motion` implementation route is source-pinned, locally scoped, and deletion-gated.

Claim blocked: no executable, trace, visible, or score behavior changed in this research checkpoint.
