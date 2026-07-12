# Map Active-root Presentation Promotion

Type: research
Status: resolved
Blocked by: None

## Question

What is the smallest source-backed browser-visible promotion for one already-live P3-P8 Tag root without granting effect, collision, combat, round, HUD, audio, or resource ownership implicitly?

## Acceptance

- Pin upstream standby/draw, camera participation, shadow, and Tag handoff behavior at the repository revision already used by the I2 lane.
- Map local `MugenSnapshot.actors`, reserve projections, camera targets, renderer actor ownership, HUD/audio discovery, collision debug, and reset against `RuntimeRootPhaseCapabilities/v1`.
- Decide outgoing/incoming visibility and camera timing independently from direct input, effects, combat, round, HUD slots, audio, and resources.
- Select one implementation-ready presentation policy with explicit actor ids, frame timing, browser diagnostics, desktop/mobile screenshots, canvas-pixel checks, reset behavior, failure paths, and deletion criteria.
- Preserve pair behavior and historical traces; update research, report, roadmap, workplan, progress, backlog, scorecard, and issue 07 without changing runtime behavior or scores in this research ticket.

## Claim Ceiling

Allowed: one source-backed presentation implementation boundary over the already-executable `active-motion` phase.

Blocked: executable/visible P3-P8 presentation until a later implementation ticket lands; collision, combat, effects, round, camera parity beyond the selected subset, HUD/lifebars, audio, resources, direct native input/AI, ZSS/Lua, rollback, netplay, scores, or full IKEMEN parity.

## Answer

Publish separate runtime-owned draw and camera root ids without widening or reordering `snapshot.actors`. Explicit Tag draw admits non-disabled/non-standby player roots unless `AssertSpecial invisible`; camera participation is independent and also honors `ScreenBound moveCameraX`. Three.js receives only selected character bodies/shadows, while collision, hit sparks, effects, HUD, audio, combat, round, and resources remain P1/P2-owned. The first handoff hides the outgoing standby root immediately because local Tag ZSS leaving/waiting choreography is not executable yet. Wayfinder 099 owns implementation, required trace evidence, and desktop/mobile browser proof. Full reasoning is in `docs/research/2026-07-11-ikemen-active-root-presentation-promotion.md`.
