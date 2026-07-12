# Execute Active-root Presentation Handoff

Type: implementation
Status: ready
Blocked by: None

## Goal

Make an already-live explicit-Tag P3-P8 root browser-visible and camera-tracked through a runtime-owned presentation projection without granting pair-owned gameplay consumers.

## Acceptance

- Add renderer-independent `RuntimeRootPresentation/v0` with stable per-root reasons plus ordered draw and camera ids.
- Preserve `snapshot.actors = [p1,p2]` and separate `reserveActors`; legacy, unknown, and Single behavior remains unchanged.
- For explicit Tag, draw non-disabled/non-standby player roots unless `AssertSpecial invisible`; select camera independently through standby and `ScreenBound moveCameraX`.
- Make shadow eligibility follow draw visibility plus existing local/global no-shadow behavior.
- Route selected draw roots only into `CharacterRenderer`; keep hit sparks, collision debug, effects, audio, HUD, combat, round, and resources pair-owned.
- Reconcile `MatchWorld.rootParticipation` and `RuntimeRootPhaseCapabilities/v1` presentation values from the new projection.
- Prove immediate P1-to-P3 draw/camera handoff, disabled/invisible/ScreenBound failures, over-KO behavior, no empty-side fallback, snapshot isolation, and reset/stale-mesh cleanup.
- Add one required imported presentation trace and desktop/mobile QA screenshots, canvas-pixel checks, renderer diagnostics, and matching actor ids.
- Pass full tests, TypeScript 7, build, trace, smoke, boundaries, visual inspection, and diff gates; update all roadmap/report/support surfaces and commit the feature.

## Claim Ceiling

Allowed: bounded immediate P3-P8 body/shadow/camera presentation under explicit IKEMEN Tag with stable P1/P2 HUD/gameplay ownership.

Blocked: exact leaving/entering overlap, Tag ZSS/Lua, camera Y/zoom parity, P3 collision/effects/audio/HUD/combat/round/resources/direct native input/AI, scores, or full IKEMEN presentation parity.
