# IKEMEN Active-root Presentation Research Report

Date: 2026-07-11
Scope: Wayfinder 098
Compatibility profile: explicit `ikemen-go` Tag

## Result

- Pinned IKEMEN keeps draw, shadow, camera, standby, and Tag-state choreography separate. Standby does not remove a character from draw enrollment; authored `invisible` suppresses body and shadow, while camera tracking independently rejects standby and honors `movecamera`.
- Local `snapshot.actors` is a shared P1/P2 contract for renderer, HUD, audio, collision debug, hit sparks, and many app reads. `reserveActors` is registry/trace telemetry only.
- Wayfinder 099 will add renderer-independent `RuntimeRootPresentation/v0` draw/camera ids without reordering or widening `snapshot.actors`.
- The first bounded handoff hides the outgoing standby root immediately and shows/tracks the incoming non-standby root. This intentionally omits IKEMEN's leaving overlap until Tag ZSS state choreography executes.
- Three.js will consume only draw ids for character bodies/shadows. Collision debug, hit sparks, effects, HUD, audio, combat, round, and resources remain pair-owned.

## Evidence

- Official source is pinned at `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`: [draw/shadow](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12649-L12857), [camera](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12058-L12112), [Tag states](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L72-L148), and [switch orchestration](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L239-L327).
- Local owners audited: `RuntimeSnapshotWorld`, `RuntimeMatchPresentationSnapshotWorld`, `MatchWorld`, `ThreeMugenRenderer`, `CharacterRenderer`, App HUD/debug reads, `MugenAudioSystem`, and reset.
- Full reasoning, selected schema, browser oracle, adversarial audit, and deletion criteria: [`docs/research/2026-07-11-ikemen-active-root-presentation-promotion.md`](../research/2026-07-11-ikemen-active-root-presentation-promotion.md).

## Verification

- Research/source audit: passed.
- Local ownership audit: passed.
- Runtime behavior, tests, TypeScript, build, trace aggregate, and browser output: unchanged and not re-run for this docs-only checkpoint.
- Historical evidence remains 174 files / 1781 tests and 541/541 traces; those numbers are not fresh evidence for this ticket.
- Final docs diff gate is recorded in the commit closeout.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 098 acceptance

Verification state: docs/source verified; executable presentation not yet implemented

Claim allowed: one source-backed, renderer-independent immediate draw/camera handoff is implementation-ready.

Claim blocked: visible P3-P8, exact Tag overlap/ZSS choreography, collision, effects, HUD/audio, combat, round, resources, score movement, or full IKEMEN parity.
